"""
FastAPI middleware for monitoring and logging integration.
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from services.monitoring import monitoring_service, correlation_id, user_id, request_path

class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for request monitoring and logging"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Extract user ID from request if available
        current_user_id = None
        try:
            # Try to get user from JWT token or session
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                # You might want to decode the JWT here to get user ID
                # For now, we'll use a placeholder
                current_user_id = "authenticated_user"
        except Exception:
            pass
        
        # Start monitoring
        start_time = time.time()
        corr_id = monitoring_service.log_request_start(
            path=str(request.url.path),
            method=request.method,
            user_id_param=current_user_id
        )
        
        # Set context variables
        correlation_id.set(corr_id)
        request_path.set(str(request.url.path))
        if current_user_id:
            user_id.set(current_user_id)
        
        # Add correlation ID to response headers
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = corr_id
        
        # End monitoring
        duration_ms = (time.time() - start_time) * 1000
        monitoring_service.log_request_end(
            path=str(request.url.path),
            method=request.method,
            status_code=response.status_code,
            duration_ms=duration_ms,
            user_id_param=current_user_id
        )
        
        return response

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for error handling and logging"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Log the error with full context
            monitoring_service.log_error(e, {
                'request_path': str(request.url.path),
                'request_method': request.method,
                'request_headers': dict(request.headers),
                'client_ip': request.client.host if request.client else None,
                'user_agent': request.headers.get('user-agent'),
            })
            
            # Re-raise the exception for FastAPI to handle
            raise 