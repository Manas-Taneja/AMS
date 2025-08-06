from fastapi.responses import RedirectResponse
from typing import Dict, Optional
from config import settings
from logging_config import get_logger

# Get logger for this module
logger = get_logger(__name__)

class OAuthErrorHandler:
    """Handles OAuth errors with user-friendly messages"""
    
    # Error message mappings
    ERROR_MESSAGES = {
        "access_denied": {
            "title": "Access Denied",
            "message": "You denied access to your Google account. Please try again and grant the necessary permissions.",
            "severity": "warning"
        },
        "invalid_state": {
            "title": "Session Expired",
            "message": "Your session has expired. Please try logging in again.",
            "severity": "error"
        },
        "no_code": {
            "title": "Authentication Failed",
            "message": "No authorization code received from Google. Please try again.",
            "severity": "error"
        },
        "timeout": {
            "title": "Request Timeout",
            "message": "The request to Google took too long. Please check your internet connection and try again.",
            "severity": "warning"
        },
        "network_error": {
            "title": "Network Error",
            "message": "Unable to connect to Google's servers. Please check your internet connection and try again.",
            "severity": "warning"
        },
        "invalid_response": {
            "title": "Invalid Response",
            "message": "Received an invalid response from Google. Please try again.",
            "severity": "error"
        },
        "oauth_failed": {
            "title": "Authentication Failed",
            "message": "An unexpected error occurred during authentication. Please try again.",
            "severity": "error"
        },
        "redis_unavailable": {
            "title": "Service Temporarily Unavailable",
            "message": "Authentication service is temporarily unavailable. Please try again in a few minutes.",
            "severity": "error"
        },
        "state_already_used": {
            "title": "Security Error",
            "message": "This authentication request has already been used. Please start a new login session.",
            "severity": "error"
        }
    }
    
    @classmethod
    def handle_error(cls, error: str, additional_info: Optional[str] = None) -> RedirectResponse:
        """Handle OAuth errors and redirect with appropriate error message"""
        error_data = cls.ERROR_MESSAGES.get(error, {
            "title": "Authentication Error",
            "message": "An unexpected error occurred during authentication.",
            "severity": "error"
        })
        
        # Build error parameters for frontend
        error_params = {
            "error": error,
            "title": error_data["title"],
            "message": error_data["message"],
            "severity": error_data["severity"]
        }
        
        if additional_info:
            error_params["additional_info"] = additional_info
        
        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in error_params.items()])
        
        redirect_url = f"{settings.frontend_url}/login?{query_string}"
        return RedirectResponse(url=redirect_url)
    
    @classmethod
    def get_error_info(cls, error: str) -> Dict[str, str]:
        """Get error information for logging or debugging"""
        return cls.ERROR_MESSAGES.get(error, {
            "title": "Unknown Error",
            "message": "An unknown error occurred",
            "severity": "error"
        })
    
    @classmethod
    def log_error(cls, error: str, context: Optional[Dict] = None):
        """Log OAuth errors for debugging"""
        error_info = cls.get_error_info(error)
        log_message = f"OAuth Error: {error} - {error_info['title']}: {error_info['message']}"
        
        if context:
            log_message += f" Context: {context}"
        
        if settings.debug:
            logger.debug(log_message)
        else:
            logger.error(log_message) 