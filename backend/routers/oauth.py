"""
OAuth router for AMS Backend.
Handles Google OAuth authentication with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
import requests
from logging_config import get_logger

from database import get_db
from models import User
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from rate_limiting import rate_limit_auth
from error_handlers import ValidationError, AuthenticationError, create_error_response
from config import settings

# Get logger for this module
logger = get_logger(__name__)

# Import OAuth components
from oauth_manager import oauth_state_manager
from oauth_errors import OAuthErrorHandler
from oauth_security import oauth_security

router = APIRouter(prefix="/auth", tags=["OAuth"])

# Google OAuth configuration
GOOGLE_CLIENT_ID = settings.google_client_id
GOOGLE_CLIENT_SECRET = settings.google_client_secret
GOOGLE_REDIRECT_URI = settings.google_redirect_uri
FRONTEND_URL = settings.frontend_url

@router.get("/google")
@rate_limit_auth("10/minute")
def google_auth(request: Request):
    """Initiate Google OAuth flow with improved security and PKCE"""
    try:
        # Clean up expired tokens before processing
        oauth_state_manager.cleanup_expired_states()
        
        # Generate state and PKCE using the manager
        oauth_data = oauth_state_manager.generate_state_and_pkce()
        state = oauth_data['state']
        code_challenge = oauth_data['code_challenge']
        
        google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
            "state": state,  # CSRF protection
            "code_challenge": code_challenge,  # PKCE challenge
            "code_challenge_method": "S256"  # SHA256 method
        }
        
        # Build the authorization URL
        auth_url = f"{google_auth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
        return RedirectResponse(url=auth_url)
        
    except Exception as e:
        OAuthErrorHandler.log_error("oauth_failed", {"context": "google_auth_init", "error": str(e)})
        return OAuthErrorHandler.handle_error("oauth_failed")

@router.get("/google/callback")
@rate_limit_auth("10/minute")
def google_auth_callback(request: Request, code: str, state: str = None, error: str = None, db: Session = Depends(get_db)):
    """Handle Google OAuth callback with improved error handling"""
    try:
        # Check for OAuth errors
        if error:
            OAuthErrorHandler.log_error("access_denied", {"error": error})
            return OAuthErrorHandler.handle_error("access_denied")
        
        if not code:
            OAuthErrorHandler.log_error("no_code")
            return OAuthErrorHandler.handle_error("no_code")
        
        # Validate state parameter
        if state is None:
            OAuthErrorHandler.log_error("invalid_state", {"reason": "no_state"})
            return OAuthErrorHandler.handle_error("invalid_state")
        
        # Get stored state data from Redis
        state_data = oauth_state_manager.get_state_data(state)
        if not state_data:
            OAuthErrorHandler.log_error("invalid_state", {"reason": "state_not_found", "state": state})
            return OAuthErrorHandler.handle_error("invalid_state")
        
        # Validate state timestamp
        if not oauth_security.validate_state_timestamp(state_data.get('timestamp', 0)):
            OAuthErrorHandler.log_error("invalid_state", {"reason": "expired_timestamp"})
            return OAuthErrorHandler.handle_error("invalid_state")
        
        # Check if state has already been used (prevent replay attacks)
        if state_data.get('used'):
            OAuthErrorHandler.log_error("state_already_used", {"state": state})
            return OAuthErrorHandler.handle_error("state_already_used")
        
        # Mark state as used
        if not oauth_state_manager.mark_state_used(state):
            OAuthErrorHandler.log_error("invalid_state", {"reason": "failed_to_mark_used"})
            return OAuthErrorHandler.handle_error("invalid_state")
        
        code_verifier = state_data.get('code_verifier')

        # Exchange authorization code for access token with PKCE
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "code_verifier": code_verifier  # PKCE code verifier
        }
        
        token_response = requests.post(token_url, data=token_data, timeout=10)
        token_response.raise_for_status()
        token_info = token_response.json()
        
        # Validate token response
        if 'access_token' not in token_info:
            raise ValueError("No access token received from Google")
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token_info['access_token']}"}
        user_response = requests.get(user_info_url, headers=headers, timeout=10)
        user_response.raise_for_status()
        user_info = user_response.json()
        
        # Debug: Log user info for troubleshooting
        if settings.debug:
            logger.debug(f"Google user info: {user_info}")
        
        # Validate required user info
        if not oauth_security.validate_google_user_info(user_info):
            missing_email = not user_info.get('email')
            missing_name = not (
                user_info.get('name') or 
                user_info.get('display_name') or
                (user_info.get('given_name') or user_info.get('family_name'))
            )
            missing_fields = []
            if missing_email:
                missing_fields.append('email')
            if missing_name:
                missing_fields.append('name (or given_name/family_name)')
            raise ValueError(f"Invalid or incomplete user info from Google. Missing fields: {missing_fields}")
        
        # Extract name from user info (handle different Google response formats)
        user_name = (
            user_info.get('name') or 
            user_info.get('display_name') or
            f"{user_info.get('given_name', '')} {user_info.get('family_name', '')}".strip() or
            user_info['email'].split('@')[0]  # Fallback to email prefix
        )
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info['email']).first()
        
        if not user:
            # Auto-create with 'pending' role
            username = user_info['email'].split('@')[0]
            # Ensure username is unique
            counter = 1
            original_username = username
            while db.query(User).filter(User.username == username).first():
                username = f"{original_username}{counter}"
                counter += 1
            
            user = User(
                email=user_info['email'],
                username=username,
                full_name=user_name,
                hashed_password=None,  # No password for OAuth users
                role='pending',  # Requires admin approval
                is_superuser=False,
                is_oauth_user=True  # Mark as OAuth user
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update user info if needed
            if user.full_name != user_name:
                user.full_name = user_name
                db.commit()
        
        # Create JWT token and return
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        # Set token as an HTTP-only cookie and redirect without token in URL
        response = RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?user_id={user.id}")
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            secure=settings.environment == "production",  # HTTPS only in production
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        return response
        
    except requests.exceptions.Timeout:
        OAuthErrorHandler.log_error("timeout")
        return OAuthErrorHandler.handle_error("timeout")
    except requests.exceptions.RequestException as e:
        OAuthErrorHandler.log_error("network_error", {"error": str(e)})
        return OAuthErrorHandler.handle_error("network_error")
    except ValueError as e:
        OAuthErrorHandler.log_error("invalid_response", {"error": str(e)})
        return OAuthErrorHandler.handle_error("invalid_response")
    except Exception as e:
        OAuthErrorHandler.log_error("oauth_failed", {"error": str(e)})
        return OAuthErrorHandler.handle_error("oauth_failed") 