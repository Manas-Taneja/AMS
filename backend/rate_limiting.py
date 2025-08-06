"""
Rate limiting configuration and middleware for AMS Backend.
Provides protection against brute force attacks and DoS vulnerabilities.
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from config import settings

# Create rate limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
RATE_LIMITS = {
    # Authentication endpoints (strict limits)
    "auth_login": "5/minute",  # 5 login attempts per minute
    "auth_register": "3/hour",  # 3 registration attempts per hour
    "auth_oauth": "10/minute",  # 10 OAuth attempts per minute
    
    # API endpoints (moderate limits)
    "api_general": "100/minute",  # General API calls
    "api_search": "30/minute",  # Search operations
    "api_create": "20/minute",  # Create operations
    "api_update": "30/minute",  # Update operations
    "api_delete": "10/minute",  # Delete operations
    
    # Admin endpoints (higher limits for admins)
    "admin_general": "200/minute",  # Admin operations
    
    # File operations (strict limits)
    "file_upload": "10/hour",  # File uploads
    "file_download": "50/minute",  # File downloads
    
    # Health and status endpoints (higher limits)
    "health_check": "1000/minute",  # Health checks
}

def get_rate_limit_for_endpoint(endpoint: str, user_role: Optional[str] = None) -> str:
    """Get appropriate rate limit for an endpoint based on user role"""
    
    # Admin users get higher limits
    if user_role == "admin":
        if "admin" in endpoint:
            return RATE_LIMITS["admin_general"]
        # Admins get 2x the normal limits for most operations
        base_limit = RATE_LIMITS.get("api_general", "100/minute")
        return _double_rate_limit(base_limit)
    
    # Manager users get slightly higher limits
    if user_role == "manager":
        base_limit = RATE_LIMITS.get("api_general", "100/minute")
        return _increase_rate_limit(base_limit, 1.5)
    
    # Default limits for regular users
    return RATE_LIMITS.get("api_general", "100/minute")

def _double_rate_limit(rate_limit: str) -> str:
    """Double the rate limit (e.g., '100/minute' -> '200/minute')"""
    try:
        number, period = rate_limit.split("/")
        return f"{int(number) * 2}/{period}"
    except:
        return rate_limit

def _increase_rate_limit(rate_limit: str, multiplier: float) -> str:
    """Increase rate limit by a multiplier"""
    try:
        number, period = rate_limit.split("/")
        return f"{int(int(number) * multiplier)}/{period}"
    except:
        return rate_limit

def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting"""
    # Try to get user from JWT token first
    try:
        from auth import verify_token
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            username = verify_token(token)
            if username:
                return f"user:{username}"
    except:
        pass
    
    # Fallback to IP address
    try:
        return get_remote_address(request)
    except:
        # If all else fails, use a default identifier
        return "unknown"

def create_rate_limited_response(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Create a user-friendly rate limit exceeded response"""
    # Default retry after 60 seconds
    retry_after = 60
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": retry_after
        },
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(retry_after)
        }
    )

# Rate limiting decorators for different endpoint types
def rate_limit_auth(limit: str = "5/minute"):
    """Rate limiting decorator for authentication endpoints"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_api(limit: str = "100/minute"):
    """Rate limiting decorator for general API endpoints"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_admin(limit: str = "200/minute"):
    """Rate limiting decorator for admin endpoints"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_file(limit: str = "10/hour"):
    """Rate limiting decorator for file operations"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_search(limit: str = "30/minute"):
    """Rate limiting decorator for search operations"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_create(limit: str = "20/minute"):
    """Rate limiting decorator for create operations"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_update(limit: str = "30/minute"):
    """Rate limiting decorator for update operations"""
    return limiter.limit(limit, key_func=get_user_identifier)

def rate_limit_delete(limit: str = "10/minute"):
    """Rate limiting decorator for delete operations"""
    return limiter.limit(limit, key_func=get_user_identifier)

# Dynamic rate limiting based on user role
def dynamic_rate_limit(endpoint_type: str = "api_general"):
    """Dynamic rate limiting based on endpoint type and user role"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get user role from current_user if available
            user_role = None
            for arg in args:
                if hasattr(arg, 'role'):
                    user_role = arg.role
                    break
            
            # Get appropriate rate limit
            limit = get_rate_limit_for_endpoint(endpoint_type, user_role)
            return limiter.limit(limit, key_func=get_user_identifier)(func)(*args, **kwargs)
        return wrapper
    return decorator

# Rate limiting configuration for different environments
def get_rate_limit_config() -> Dict[str, Any]:
    """Get rate limiting configuration based on environment"""
    if settings.environment == "production":
        return {
            "auth_login": "3/minute",  # Stricter in production
            "auth_register": "1/hour",  # Very strict in production
            "api_general": "50/minute",  # Moderate in production
            "file_upload": "5/hour",  # Stricter in production
        }
    else:
        return {
            "auth_login": "10/minute",  # More lenient in development
            "auth_register": "5/hour",  # More lenient in development
            "api_general": "200/minute",  # More lenient in development
            "file_upload": "20/hour",  # More lenient in development
        } 