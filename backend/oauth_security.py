import hashlib
import secrets
import time
from typing import Dict, Optional
from urllib.parse import urlencode, parse_qs, urlparse
from config import settings

class OAuthSecurityUtils:
    """Security utilities for OAuth implementation"""
    
    @staticmethod
    def validate_redirect_uri(redirect_uri: str) -> bool:
        """Validate that redirect URI is allowed"""
        allowed_uris = [
            settings.google_redirect_uri,
            f"{settings.frontend_url}/auth/callback"
        ]
        return redirect_uri in allowed_uris
    
    @staticmethod
    def sanitize_oauth_params(params: Dict[str, str]) -> Dict[str, str]:
        """Sanitize OAuth parameters to prevent injection attacks"""
        allowed_params = {
            'client_id', 'redirect_uri', 'response_type', 'scope',
            'access_type', 'prompt', 'state', 'code_challenge',
            'code_challenge_method'
        }
        
        sanitized = {}
        for key, value in params.items():
            if key in allowed_params:
                # Basic sanitization
                sanitized[key] = str(value).strip()
        
        return sanitized
    
    @staticmethod
    def generate_nonce() -> str:
        """Generate a nonce for additional security"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_state_timestamp(timestamp: float, max_age: int = 600) -> bool:
        """Validate that state token is not too old"""
        return time.time() - timestamp <= max_age
    
    @staticmethod
    def hash_user_identifier(email: str, google_id: Optional[str] = None) -> str:
        """Create a consistent user identifier hash"""
        identifier = f"{email}:{google_id or 'unknown'}"
        return hashlib.sha256(identifier.encode()).hexdigest()
    
    @staticmethod
    def validate_google_user_info(user_info: Dict) -> bool:
        """Validate Google user info response"""
        # Check for email (required)
        if not user_info.get('email'):
            return False
        
        # Check for name (can be 'name', 'given_name' + 'family_name', or 'display_name')
        has_name = (
            user_info.get('name') or 
            user_info.get('given_name') or 
            user_info.get('display_name') or
            (user_info.get('given_name') and user_info.get('family_name'))
        )
        
        return bool(has_name)
    
    @staticmethod
    def create_secure_session_id(user_id: int, timestamp: float) -> str:
        """Create a secure session identifier"""
        data = f"{user_id}:{timestamp}:{settings.secret_key}"
        return hashlib.sha256(data.encode()).hexdigest()

# Global security utils instance
oauth_security = OAuthSecurityUtils() 