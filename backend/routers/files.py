"""
Files router for AMS Backend.
Handles file upload and download operations with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Optional

from models import User
from auth import get_current_active_user
from middleware import require_staff_or_above
from rate_limiting import rate_limit_api
from error_handlers import ValidationError, NotFoundError, create_error_response
from file_upload import file_upload_manager

router = APIRouter(prefix="/api/files", tags=["Files"])

@router.get("/{file_path:path}")
@require_staff_or_above
@rate_limit_api("50/minute")
async def download_file(
    request: Request,
    file_path: str,
    current_user: User = Depends(get_current_active_user)
):
    """Download a file"""
    try:
        if not file_path:
            raise ValidationError("File path is required")
        
        return await file_upload_manager.get_file(file_path)
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to download file",
                error_code="FILE_DOWNLOAD_ERROR"
            )
        )

@router.get("/info")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_file_upload_info(request: Request, current_user: User = Depends(get_current_active_user)):
    """Get file upload configuration information"""
    try:
        return {
            "allowed_extensions": file_upload_manager.get_allowed_extensions(),
            "max_file_size": file_upload_manager.get_max_file_size(),
            "max_file_size_mb": file_upload_manager.get_max_file_size() / (1024 * 1024)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve file upload info",
                error_code="FILE_INFO_ERROR"
            )
        ) 