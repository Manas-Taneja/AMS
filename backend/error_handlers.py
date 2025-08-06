"""
Centralized error handling for AMS Backend.
Provides consistent error responses and logging.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from jose import JWTError
from slowapi.errors import RateLimitExceeded
from logging_config import get_logger

# Get logger for this module
logger = get_logger(__name__)

class AMSException(Exception):
    """Base exception for AMS application"""
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        details: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.error_code = error_code or self.__class__.__name__.upper()
        self.timestamp = datetime.utcnow().isoformat()
        super().__init__(self.message)

class ValidationError(AMSException):
    """Validation error exception"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=400, details=details, error_code="VALIDATION_ERROR")

class AuthenticationError(AMSException):
    """Authentication error exception"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401, error_code="AUTHENTICATION_ERROR")

class AuthorizationError(AMSException):
    """Authorization error exception"""
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403, error_code="AUTHORIZATION_ERROR")

class NotFoundError(AMSException):
    """Resource not found exception"""
    def __init__(self, resource: str, resource_id: Any):
        message = f"{resource} with id {resource_id} not found"
        super().__init__(message, status_code=404, error_code="NOT_FOUND_ERROR")

class ConflictError(AMSException):
    """Resource conflict exception"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=409, details=details, error_code="CONFLICT_ERROR")

class RateLimitError(AMSException):
    """Rate limit exceeded exception"""
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status_code=429, error_code="RATE_LIMIT_ERROR")

class DatabaseError(AMSException):
    """Database operation error exception"""
    def __init__(self, message: str = "Database operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details, error_code="DATABASE_ERROR")

class FileOperationError(AMSException):
    """File operation error exception"""
    def __init__(self, message: str = "File operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details, error_code="FILE_OPERATION_ERROR")

class ExternalServiceError(AMSException):
    """External service error exception"""
    def __init__(self, service: str, message: str = "External service error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=502, details=details, error_code=f"{service.upper()}_SERVICE_ERROR")

def create_error_response(
    status_code: int,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    error_code: Optional[str] = None,
    timestamp: Optional[str] = None,
    path: Optional[str] = None,
    method: Optional[str] = None
) -> Dict[str, Any]:
    """Create standardized error response"""
    response = {
        "success": False,
        "error": {
            "code": error_code or "UNKNOWN_ERROR",
            "message": message,
            "status_code": status_code,
            "timestamp": timestamp or datetime.utcnow().isoformat()
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    if path:
        response["error"]["path"] = path
    
    if method:
        response["error"]["method"] = method
    
    return response

def create_success_response(
    data: Any,
    message: Optional[str] = None,
    status_code: int = 200,
    timestamp: Optional[str] = None
) -> Dict[str, Any]:
    """Create standardized success response"""
    response = {
        "success": True,
        "data": data,
        "status_code": status_code,
        "timestamp": timestamp or datetime.utcnow().isoformat()
    }
    
    if message:
        response["message"] = message
    
    return response

async def ams_exception_handler(request: Request, exc: AMSException) -> JSONResponse:
    """Handle AMS custom exceptions"""
    logger.error(f"AMS Exception: {exc.message}", extra={
        "status_code": exc.status_code,
        "path": request.url.path,
        "method": request.method,
        "details": exc.details,
        "error_code": exc.error_code
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            status_code=exc.status_code,
            message=exc.message,
            details=exc.details,
            error_code=exc.error_code,
            timestamp=exc.timestamp,
            path=request.url.path,
            method=request.method
        )
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation Error: {exc.errors()}", extra={
        "path": request.url.path,
        "method": request.method
    })
    
    # Extract field-specific errors
    field_errors = []
    for error in exc.errors():
        field_errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Validation error",
            details={"field_errors": field_errors},
            error_code="VALIDATION_ERROR",
            path=request.url.path,
            method=request.method
        )
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy database errors"""
    logger.error(f"Database Error: {str(exc)}", extra={
        "path": request.url.path,
        "method": request.method,
        "error_type": type(exc).__name__
    })
    
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=create_error_response(
                status_code=status.HTTP_409_CONFLICT,
                message="Database integrity error - resource already exists or constraint violated",
                error_code="INTEGRITY_ERROR",
                path=request.url.path,
                method=request.method
            )
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Database error occurred",
            error_code="DATABASE_ERROR",
            path=request.url.path,
            method=request.method
        )
    )

async def jwt_exception_handler(request: Request, exc: JWTError) -> JSONResponse:
    """Handle JWT token errors"""
    logger.warning(f"JWT Error: {str(exc)}", extra={
        "path": request.url.path,
        "method": request.method
    })
    
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid or expired token",
            error_code="JWT_ERROR",
            path=request.url.path,
            method=request.method
        )
    )

async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handle rate limiting errors"""
    logger.info(f"Rate limit exceeded: {request.client.host}", extra={
        "path": request.url.path,
        "method": request.method,
        "client_ip": request.client.host
    })
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content=create_error_response(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            message="Rate limit exceeded. Please try again later.",
            error_code="RATE_LIMIT_EXCEEDED",
            path=request.url.path,
            method=request.method
        ),
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": "0",
            "X-RateLimit-Remaining": "0"
        }
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general unhandled exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}", extra={
        "path": request.url.path,
        "method": request.method,
        "error_type": type(exc).__name__
    }, exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An unexpected error occurred",
            error_code="INTERNAL_ERROR",
            path=request.url.path,
            method=request.method
        )
    )

def register_exception_handlers(app):
    """Register all exception handlers with FastAPI app"""
    app.add_exception_handler(AMSException, ams_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(JWTError, jwt_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler) 