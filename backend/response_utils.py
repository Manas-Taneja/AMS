"""
Response utilities for AMS Backend.
Provides standardized response functions for consistent API responses.
"""

from typing import Any, Optional, Dict, List
from datetime import datetime
from fastapi.responses import JSONResponse
from fastapi import status
from error_handlers import create_success_response, create_error_response

def success_response(
    data: Any,
    message: Optional[str] = None,
    status_code: int = 200,
    headers: Optional[Dict[str, str]] = None
) -> JSONResponse:
    """
    Create a standardized success response
    
    Args:
        data: The response data
        message: Optional success message
        status_code: HTTP status code (default: 200)
        headers: Optional response headers
    
    Returns:
        JSONResponse with standardized success format
    """
    content = create_success_response(
        data=data,
        message=message,
        status_code=status_code
    )
    
    return JSONResponse(
        status_code=status_code,
        content=content,
        headers=headers
    )

def error_response(
    message: str,
    status_code: int = 500,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    path: Optional[str] = None,
    method: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> JSONResponse:
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code (default: 500)
        error_code: Optional error code for categorization
        details: Optional error details
        path: Optional request path
        method: Optional HTTP method
        headers: Optional response headers
    
    Returns:
        JSONResponse with standardized error format
    """
    content = create_error_response(
        status_code=status_code,
        message=message,
        details=details,
        error_code=error_code,
        path=path,
        method=method
    )
    
    return JSONResponse(
        status_code=status_code,
        content=content,
        headers=headers
    )

def paginated_response(
    data: List[Any],
    total: int,
    page: int,
    size: int,
    message: Optional[str] = None,
    status_code: int = 200
) -> JSONResponse:
    """
    Create a standardized paginated response
    
    Args:
        data: List of items for current page
        total: Total number of items
        page: Current page number
        size: Page size
        message: Optional success message
        status_code: HTTP status code (default: 200)
    
    Returns:
        JSONResponse with paginated data format
    """
    total_pages = (total + size - 1) // size
    
    pagination_info = {
        "current_page": page,
        "page_size": size,
        "total_items": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }
    
    response_data = {
        "items": data,
        "pagination": pagination_info
    }
    
    return success_response(
        data=response_data,
        message=message,
        status_code=status_code
    )

def created_response(
    data: Any,
    message: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> JSONResponse:
    """
    Create a standardized 201 Created response
    
    Args:
        data: The created resource data
        message: Optional success message
        headers: Optional response headers
    
    Returns:
        JSONResponse with 201 status
    """
    return success_response(
        data=data,
        message=message or "Resource created successfully",
        status_code=status.HTTP_201_CREATED,
        headers=headers
    )

def updated_response(
    data: Any,
    message: Optional[str] = None
) -> JSONResponse:
    """
    Create a standardized 200 OK response for updates
    
    Args:
        data: The updated resource data
        message: Optional success message
    
    Returns:
        JSONResponse with 200 status
    """
    return success_response(
        data=data,
        message=message or "Resource updated successfully",
        status_code=status.HTTP_200_OK
    )

def deleted_response(
    message: Optional[str] = None
) -> JSONResponse:
    """
    Create a standardized 204 No Content response for deletions
    
    Args:
        message: Optional success message
    
    Returns:
        JSONResponse with 204 status
    """
    return success_response(
        data=None,
        message=message or "Resource deleted successfully",
        status_code=status.HTTP_204_NO_CONTENT
    )

def not_found_response(
    resource: str,
    resource_id: Any,
    error_code: str = "NOT_FOUND_ERROR"
) -> JSONResponse:
    """
    Create a standardized 404 Not Found response
    
    Args:
        resource: Type of resource (e.g., "User", "Project")
        resource_id: ID of the resource that was not found
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 404 status
    """
    return error_response(
        message=f"{resource} with id {resource_id} not found",
        status_code=status.HTTP_404_NOT_FOUND,
        error_code=error_code
    )

def validation_error_response(
    message: str,
    field_errors: Optional[List[Dict[str, str]]] = None,
    error_code: str = "VALIDATION_ERROR"
) -> JSONResponse:
    """
    Create a standardized 400 Bad Request response for validation errors
    
    Args:
        message: Validation error message
        field_errors: List of field-specific errors
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 400 status
    """
    details = None
    if field_errors:
        details = {"field_errors": field_errors}
    
    return error_response(
        message=message,
        status_code=status.HTTP_400_BAD_REQUEST,
        error_code=error_code,
        details=details
    )

def unauthorized_response(
    message: str = "Authentication required",
    error_code: str = "AUTHENTICATION_ERROR"
) -> JSONResponse:
    """
    Create a standardized 401 Unauthorized response
    
    Args:
        message: Authentication error message
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 401 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_401_UNAUTHORIZED,
        error_code=error_code
    )

def authentication_error_response(
    message: str = "Authentication failed",
    error_code: str = "AUTHENTICATION_ERROR"
) -> JSONResponse:
    """
    Create a standardized 401 Authentication Error response
    
    Args:
        message: Authentication error message
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 401 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_401_UNAUTHORIZED,
        error_code=error_code
    )

def authorization_error_response(
    message: str = "Insufficient permissions",
    error_code: str = "AUTHORIZATION_ERROR"
) -> JSONResponse:
    """
    Create a standardized 403 Authorization Error response
    
    Args:
        message: Authorization error message
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 403 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_403_FORBIDDEN,
        error_code=error_code
    )

def forbidden_response(
    message: str = "Insufficient permissions",
    error_code: str = "AUTHORIZATION_ERROR"
) -> JSONResponse:
    """
    Create a standardized 403 Forbidden response
    
    Args:
        message: Authorization error message
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 403 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_403_FORBIDDEN,
        error_code=error_code
    )

def conflict_response(
    message: str,
    details: Optional[Dict[str, Any]] = None,
    error_code: str = "CONFLICT_ERROR"
) -> JSONResponse:
    """
    Create a standardized 409 Conflict response
    
    Args:
        message: Conflict error message
        details: Optional conflict details
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 409 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_409_CONFLICT,
        error_code=error_code,
        details=details
    )

def internal_error_response(
    message: str = "An internal server error occurred",
    error_code: str = "INTERNAL_ERROR",
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Create a standardized 500 Internal Server Error response
    
    Args:
        message: Internal error message
        error_code: Error code for categorization
        details: Optional error details
    
    Returns:
        JSONResponse with 500 status
    """
    return error_response(
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code=error_code,
        details=details
    )

def rate_limit_response(
    retry_after: int = 60,
    error_code: str = "RATE_LIMIT_ERROR"
) -> JSONResponse:
    """
    Create a standardized 429 Too Many Requests response
    
    Args:
        retry_after: Seconds to wait before retrying
        error_code: Error code for categorization
    
    Returns:
        JSONResponse with 429 status and retry headers
    """
    headers = {
        "Retry-After": str(retry_after),
        "X-RateLimit-Limit": "0",
        "X-RateLimit-Remaining": "0"
    }
    
    return error_response(
        message="Rate limit exceeded. Please try again later.",
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        error_code=error_code,
        headers=headers
    ) 