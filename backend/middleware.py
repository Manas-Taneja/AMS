import asyncio
from functools import wraps
from fastapi import HTTPException, status
from typing import List
from models import User

def require_role(required_roles: List[str], allow_superuser: bool = True):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, current_user: User, **kwargs):
            # Check if user is approved
            if current_user.role == 'pending':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account is pending approval. Please contact an administrator."
                )
            # Superusers can access everything if allowed
            if allow_superuser and current_user.is_superuser:
                if asyncio.iscoroutinefunction(func):
                    return func(*args, current_user=current_user, **kwargs)
                else:
                    return func(*args, current_user=current_user, **kwargs)
            # Check if user has required role
            if current_user.role not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}"
                )
            if asyncio.iscoroutinefunction(func):
                return func(*args, current_user=current_user, **kwargs)
            else:
                return func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

def require_admin(func):
    return require_role(["admin"])(func)

def require_manager_or_admin(func):
    return require_role(["manager", "admin"])(func)

def require_staff_or_above(func):
    return require_role(["user", "manager", "admin"])(func)

def require_approved_user(func):
    @wraps(func)
    def wrapper(*args, current_user: User, **kwargs):
        if current_user.role == 'pending':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending approval. Please contact an administrator."
            )
        if asyncio.iscoroutinefunction(func):
            return func(*args, current_user=current_user, **kwargs)
        else:
            return func(*args, current_user=current_user, **kwargs)
    return wrapper