import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Database
    database_url: str = Field(
        default="sqlite:///backend/ams.db",
        env="DATABASE_URL",
        description="Database connection URL"
    )
    
    # Security
    secret_key: str = Field(
        default="your-secret-key-here-change-in-production",
        env="SECRET_KEY",
        description="Secret key for JWT token signing"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OAuth
    google_client_id: str = Field(
        default="your-google-client-id",
        env="GOOGLE_CLIENT_ID",
        description="Google OAuth client ID"
    )
    google_client_secret: str = Field(
        default="your-google-client-secret",
        env="GOOGLE_CLIENT_SECRET",
        description="Google OAuth client secret"
    )
    google_redirect_uri: str = Field(
        default="http://localhost:8000/auth/google/callback",
        env="GOOGLE_REDIRECT_URI",
        description="OAuth redirect/callback URL for Google"
    )
    
    # Redis for OAuth state management
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL",
        description="Redis connection URL"
    )
    
    # Frontend
    frontend_url: str = Field(
        default="http://localhost:3000",
        env="FRONTEND_URL",
        description="Frontend application URL"
    )
    
    # CORS
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000"],
        env="ALLOWED_ORIGINS",
        description="List of allowed CORS origins"
    )
    
    # Environment
    environment: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="Application environment (development/production)"
    )
    debug: bool = Field(
        default=False,
        env="DEBUG",
        description="Enable debug mode"
    )
    
    @validator("secret_key")
    def validate_secret_key(cls, v):
        # In production, secret key must be properly configured
        if os.getenv("ENVIRONMENT") == "production":
            if v == "your-secret-key-here-change-in-production":
                raise ValueError("SECRET_KEY must be properly configured in production environment")
            if len(v) < 64:  # Increased minimum length for better security
                raise ValueError("SECRET_KEY must be at least 64 characters long in production")
            # Additional validation for production
            if not any(c.isupper() for c in v) or not any(c.islower() for c in v) or not any(c.isdigit() for c in v):
                raise ValueError("SECRET_KEY must contain uppercase, lowercase, and numeric characters in production")
        elif v == "your-secret-key-here-change-in-production":
            # In development, generate a secure key if not provided
            import secrets
            v = secrets.token_urlsafe(64)  # Increased length
            # Use logging instead of print to avoid exposing in logs
            import logging
            logger = logging.getLogger(__name__)
            logger.info("Generated development secret key for local development")
        return v
    
    @validator("google_client_id")
    def validate_google_client_id(cls, v):
        if v == "your-google-client-id" and os.getenv("ENVIRONMENT") == "production":
            raise ValueError("GOOGLE_CLIENT_ID must be configured in production")
        return v
    
    @validator("google_client_secret")
    def validate_google_client_secret(cls, v):
        if v == "your-google-client-secret" and os.getenv("ENVIRONMENT") == "production":
            raise ValueError("GOOGLE_CLIENT_SECRET must be configured in production")
        return v
    
    @validator("allowed_origins")
    def validate_origins(cls, v):
        if "*" in v and len(v) > 1:
            raise ValueError("Cannot use wildcard with specific origins")
        return v
    
    @validator("database_url")
    def validate_database_url(cls, v):
        if os.getenv("ENVIRONMENT") == "production" and "sqlite" in v:
            raise ValueError("SQLite is not recommended for production. Use PostgreSQL instead.")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings() 