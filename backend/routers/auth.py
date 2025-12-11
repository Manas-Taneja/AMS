"""
Authentication router for AMS Backend.
Handles login, logout, OAuth, and user management endpoints.
"""

from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import requests
import re
from typing import Optional

from database import get_db
from models import User
from schemas import (
    UserCreate, User as UserSchema, LoginRequest, LoginResponse,
    UserList, UserApproval
)
from auth import (
    authenticate_user, 
    create_access_token, 
    get_current_active_user,
    get_current_active_user_from_cookie,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from middleware import require_admin
from rate_limiting import rate_limit_auth, rate_limit_api, rate_limit_admin
from error_handlers import (
    ValidationError, AuthenticationError, AuthorizationError,
    NotFoundError, ConflictError
)
from response_utils import (
    success_response,
    created_response,
    updated_response,
    validation_error_response,
    authentication_error_response,
    authorization_error_response,
    not_found_response,
    conflict_response,
    internal_error_response
)
from config import settings
from logging_config import get_logger

# Get logger for this module
logger = get_logger(__name__)

# Import OAuth components
from oauth_manager import oauth_state_manager
from oauth_errors import OAuthErrorHandler
from oauth_security import oauth_security

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Google OAuth configuration
GOOGLE_CLIENT_ID = settings.google_client_id
GOOGLE_CLIENT_SECRET = settings.google_client_secret
GOOGLE_REDIRECT_URI = settings.google_redirect_uri
FRONTEND_URL = settings.frontend_url

@router.post("/login", response_model=LoginResponse)
@rate_limit_auth("5/minute")
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with username and password"""
    try:
        # Sanitize input
        username = login_data.username
        password = login_data.password  # Don't sanitize password
        
        logger.info(f"Login attempt for username: {username}")
        
        if not username or not password:
            raise ValidationError("Username and password are required")
        
        # Validate username format (allow emails)
        if not re.match(r"^[a-zA-Z0-9._@-]+$", username):
            raise ValidationError("Invalid username format")
        
        logger.info(f"Attempting authentication for user: {username}")
        user = authenticate_user(db, username, password)
        logger.info(f"Authentication result: {user}")
        
        if not user:
            raise AuthenticationError("Incorrect username or password")
        
        # Check if user is pending approval
        if user.role == 'pending':
            # Still allow login but return a special response indicating pending status
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.username}, expires_delta=access_token_expires
            )
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserSchema.from_orm(user)
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserSchema.from_orm(user)
        )
        
    except ValidationError as e:
        return validation_error_response(
            message=e.message,
            error_code="VALIDATION_ERROR"
        )
    except AuthenticationError as e:
        return authentication_error_response(
            message=e.message,
            error_code="AUTHENTICATION_ERROR"
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return internal_error_response(
            message="Authentication failed",
            error_code="AUTH_ERROR"
        )

@router.get("/me", response_model=UserSchema)
@rate_limit_api("100/minute")
def get_current_user_info(request: Request, current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.get("/me-cookie", response_model=UserSchema)
@rate_limit_api("100/minute")
def get_current_user_info_cookie(request: Request, current_user: User = Depends(get_current_active_user_from_cookie)):
    """Get current user information from cookie"""
    return current_user

@router.get("/oauth-status")
@rate_limit_api("100/minute")
def get_oauth_status(request: Request, current_user: User = Depends(get_current_active_user)):
    """Get OAuth status for current user"""
    return {
        "is_oauth_user": not current_user.hashed_password,
        "user_id": current_user.id,
        "role": current_user.role
    }

@router.get("/oauth-health")
@rate_limit_api("1000/minute")
def get_oauth_health(request: Request):
    """Health check for OAuth system"""
    redis_available = oauth_state_manager.is_redis_available()
    active_states = oauth_state_manager.cleanup_expired_states()
    
    return {
        "redis_available": redis_available,
        "active_oauth_states": active_states,
        "oauth_config_ready": (
            GOOGLE_CLIENT_ID != "your-google-client-id" and 
            GOOGLE_CLIENT_SECRET != "your-google-client-secret"
        )
    }

@router.post("/logout")
@rate_limit_api("50/minute")
def logout(request: Request):
    """Logout user and clear authentication cookie"""
    response = success_response(
        data=None,
        message="Successfully logged out"
    )
    
    # Clear the authentication cookie
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax"
    )
    
    return response

@router.post("/register", response_model=UserSchema)
@require_admin
@rate_limit_auth("3/hour")
def register_user(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (admin only)"""
    try:
        # Sanitize and validate input
        email = user_data.email
        username = user_data.username
        full_name = user_data.full_name
        password = user_data.password  # Don't sanitize password
        
        if not all([email, username, full_name, password]):
            raise ValidationError("All fields are required")
        
        # Validate email format
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
            raise ValidationError("Invalid email format")
        
        # Validate username format (allow emails)
        if not re.match(r"^[a-zA-Z0-9._@-]+$", username):
            raise ValidationError("Invalid username format")
        
        # Validate password strength
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            raise ConflictError("User with this email or username already exists")
        
        # Create new user
        hashed_password = get_password_hash(password)
        db_user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return UserSchema.from_orm(db_user)
        
    except (ValidationError, ConflictError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to register user",
                error_code="REGISTRATION_ERROR"
            )
        )

# Admin user management endpoints
@router.get("/admin/users", response_model=list[UserList])
@require_admin
@rate_limit_admin("100/minute")
def get_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all users (admin only)"""
    try:
        users = db.query(User).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve users",
                error_code="DATABASE_ERROR"
            )
        )

@router.get("/admin/users/pending", response_model=list[UserList])
@require_admin
@rate_limit_admin("100/minute")
def get_pending_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get users with pending role (admin only)"""
    try:
        pending_users = db.query(User).filter(User.role == 'pending').all()
        return pending_users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve pending users",
                error_code="DATABASE_ERROR"
            )
        )

@router.put("/admin/users/{user_id}/approve")
@require_admin
@rate_limit_admin("50/minute")
def approve_user(
    request: Request,
    user_id: int, 
    approval_data: UserApproval, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve user and assign role (admin only)"""
    try:
        # Validate user_id
        if user_id <= 0:
            raise ValidationError("Invalid user ID")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User", user_id)
        
        # Validate role
        allowed_roles = ['user', 'manager', 'admin']
        if approval_data.role not in allowed_roles:
            raise ValidationError(f"Role must be one of: {', '.join(allowed_roles)}")
        
        # Update user role and status
        user.role = approval_data.role
        user.is_active = approval_data.is_active
        
        # If assigning admin role, also set is_superuser
        if approval_data.role == 'admin':
            user.is_superuser = True
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": f"User {user.full_name} approved successfully",
            "user": UserSchema.from_orm(user)
        }
        
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to approve user",
                error_code="APPROVAL_ERROR"
            )
        )

@router.put("/admin/users/{user_id}/role")
@require_admin
@rate_limit_admin("50/minute")
def update_user_role(
    request: Request,
    user_id: int, 
    role: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user role (admin only)"""
    try:
        # Validate user_id
        if user_id <= 0:
            raise ValidationError("Invalid user ID")
        
        # Sanitize and validate role
        role = role.strip()
        allowed_roles = ['user', 'manager', 'admin']
        if role not in allowed_roles:
            raise ValidationError(f"Role must be one of: {', '.join(allowed_roles)}")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User", user_id)
        
        # Prevent admin from removing their own admin role
        if user.id == current_user.id and role != 'admin':
            raise AuthorizationError("Cannot remove your own admin role")
        
        user.role = role
        user.is_superuser = (role == 'admin')
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": f"User {user.full_name} role updated to {role}",
            "user": UserSchema.from_orm(user)
        }
        
    except (ValidationError, NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to update user role",
                error_code="ROLE_UPDATE_ERROR"
            )
        )

@router.put("/admin/users/{user_id}/status")
@require_admin
@rate_limit_admin("50/minute")
def update_user_status(
    request: Request,
    user_id: int, 
    is_active: bool, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user active status (admin only)"""
    try:
        # Validate user_id
        if user_id <= 0:
            raise ValidationError("Invalid user ID")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User", user_id)
        
        # Prevent admin from deactivating themselves
        if user.id == current_user.id and not is_active:
            raise AuthorizationError("Cannot deactivate your own account")
        
        user.is_active = is_active
        db.commit()
        db.refresh(user)
        
        return {
            "message": f"User {user.full_name} {'activated' if is_active else 'deactivated'}",
            "user": UserSchema.from_orm(user)
        }
        
    except (ValidationError, NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to update user status",
                error_code="STATUS_UPDATE_ERROR"
            )
        )

@router.delete("/admin/users/{user_id}")
@require_admin
@rate_limit_admin("20/minute")
def delete_user(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a user (admin only)"""
    try:
        # Validate user_id
        if user_id <= 0:
            raise ValidationError("Invalid user ID")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User", user_id)
        
        # Prevent admin from deleting themselves
        if user.id == current_user.id:
            raise AuthorizationError("Cannot delete your own account")
        
        db.delete(user)
        db.commit()
        return {"message": f"User {user.full_name} deleted successfully"}
        
    except (ValidationError, NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to delete user",
                error_code="DELETE_ERROR"
            )
        ) 