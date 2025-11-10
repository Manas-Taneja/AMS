import asyncio
from functools import wraps
from fastapi import HTTPException, status
from typing import List
from models import User

def require_role(required_roles: List[str], allow_superuser: bool = True):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, current_user: User, **kwargs):
            # Auth disabled: bypass all role checks and allow access
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
        # Auth disabled: bypass approval check
        if asyncio.iscoroutinefunction(func):
            return func(*args, current_user=current_user, **kwargs)
        else:
            return func(*args, current_user=current_user, **kwargs)
    return wrapper