"""
File upload handling for AMS Backend.
Provides secure file upload functionality with validation and storage management.
"""

import os
import hashlib
import uuid
from typing import Optional, List, Tuple
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from fastapi.responses import FileResponse
import aiofiles
import mimetypes
from datetime import datetime
from config import settings

# Configure upload settings
UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv']
}

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(exist_ok=True)

class FileUploadManager:
    """Manages file uploads with security and validation"""
    
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[bool, str]:
        """Validate uploaded file"""
        # Check file size
        if file.size and file.size > MAX_FILE_SIZE:
            return False, f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024*1024)}MB"
        
        # Check file type
        if not file.content_type:
            return False, "File content type is required"
        
        if file.content_type not in ALLOWED_EXTENSIONS:
            return False, f"File type {file.content_type} is not allowed"
        
        # Check file extension
        if file.filename:
            file_ext = Path(file.filename).suffix.lower()
            allowed_exts = ALLOWED_EXTENSIONS.get(file.content_type, [])
            if file_ext not in allowed_exts:
                return False, f"File extension {file_ext} is not allowed for {file.content_type}"
        
        return True, "File is valid"
    
    @staticmethod
    def generate_safe_filename(original_filename: str, user_id: int) -> str:
        """Generate a safe filename to prevent path traversal and conflicts"""
        # Get file extension
        file_ext = Path(original_filename).suffix.lower()
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Create safe filename: user_id_timestamp_uniqueid.ext
        safe_filename = f"{user_id}_{timestamp}_{unique_id}{file_ext}"
        
        return safe_filename
    
    @staticmethod
    def get_file_hash(file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    @staticmethod
    async def save_uploaded_file(file: UploadFile, user_id: int) -> dict:
        """Save uploaded file and return file information"""
        # Validate file
        is_valid, error_message = FileUploadManager.validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        
        # Generate safe filename
        safe_filename = FileUploadManager.generate_safe_filename(file.filename, user_id)
        file_path = UPLOAD_DIR / safe_filename
        
        # Save file
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
        
        # Calculate file hash
        file_hash = FileUploadManager.get_file_hash(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        return {
            "file_path": str(file_path),
            "file_name": file.filename,
            "safe_filename": safe_filename,
            "file_size": file_size,
            "file_type": file.content_type,
            "file_hash": file_hash,
            "uploaded_at": datetime.utcnow()
        }
    
    @staticmethod
    async def get_file(file_path: str) -> Optional[FileResponse]:
        """Get file for download"""
        path = Path(file_path)
        
        # Security check: ensure file is within upload directory
        try:
            path.resolve().relative_to(UPLOAD_DIR.resolve())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        return FileResponse(
            path=path,
            filename=path.name,
            media_type=mimetypes.guess_type(path)[0] or 'application/octet-stream'
        )
    
    @staticmethod
    async def delete_file(file_path: str) -> bool:
        """Delete uploaded file"""
        path = Path(file_path)
        
        # Security check: ensure file is within upload directory
        try:
            path.resolve().relative_to(UPLOAD_DIR.resolve())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        if path.exists():
            try:
                path.unlink()
                return True
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to delete file: {str(e)}"
                )
        
        return False
    
    @staticmethod
    def get_allowed_extensions() -> dict:
        """Get list of allowed file extensions"""
        return ALLOWED_EXTENSIONS
    
    @staticmethod
    def get_max_file_size() -> int:
        """Get maximum file size in bytes"""
        return MAX_FILE_SIZE

# Global file upload manager instance
file_upload_manager = FileUploadManager() 