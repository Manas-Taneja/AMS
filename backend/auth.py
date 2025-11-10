from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User

# Security configuration
from config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    
    # OAuth users cannot use password authentication
    if user.is_oauth_user:
        return None
    
    # Check if user has password authentication enabled
    if not user.can_use_password_auth():
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    # Auth disabled: return any existing user or a stub admin user
    user = db.query(User).first()
    if user:
        return user
    return User(
        id=0,
        email="dev@example.com",
        username="dev",
        full_name="Dev User",
        hashed_password=None,
        is_active=True,
        is_superuser=True,
        role="admin",
        is_oauth_user=False
    )

def get_current_user_from_cookie(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    # Auth disabled: return any existing user or a stub admin user
    user = db.query(User).first()
    if user:
        return user
    return User(
        id=0,
        email="dev@example.com",
        username="dev",
        full_name="Dev User",
        hashed_password=None,
        is_active=True,
        is_superuser=True,
        role="admin",
        is_oauth_user=False
    )

def get_current_user_hybrid(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    # Auth disabled: return any existing user or a stub admin user
    user = db.query(User).first()
    if user:
        return user
    return User(
        id=0,
        email="dev@example.com",
        username="dev",
        full_name="Dev User",
        hashed_password=None,
        is_active=True,
        is_superuser=True,
        role="admin",
        is_oauth_user=False
    )

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # Auth disabled: always treat user as active
    return current_user

def get_current_active_user_from_cookie(current_user: User = Depends(get_current_user_from_cookie)) -> User:
    # Auth disabled: always treat user as active
    return current_user

def get_current_active_user_hybrid(current_user: User = Depends(get_current_user_hybrid)) -> User:
    # Auth disabled: always treat user as active
    return current_user 