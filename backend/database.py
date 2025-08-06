from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from config import settings
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Database URL with environment variable support
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", settings.database_url)

# Environment-specific pool configuration
def get_pool_config():
    """Get database pool configuration based on environment"""
    if os.getenv("ENVIRONMENT") == "production":
        return {
            "pool_size": 20,
            "max_overflow": 30,
            "pool_recycle": 3600,
            "pool_timeout": 30
        }
    else:
        # Development settings - smaller pools
        return {
            "pool_size": 5,
            "max_overflow": 10,
            "pool_recycle": 1800,  # 30 minutes
            "pool_timeout": 20
        }

pool_config = get_pool_config()

# Create engine with environment-specific connection pooling
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=pool_config["pool_size"],
    max_overflow=pool_config["max_overflow"],
    pool_pre_ping=True,  # Validate connections before use
    pool_recycle=pool_config["pool_recycle"],
    pool_timeout=pool_config["pool_timeout"],
    echo=os.getenv("DEBUG", "false").lower() == "true",  # Enable SQL logging in debug mode
    # SQLite-specific settings (only used for development)
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database health check function
def check_database_health():
    """Check if database is accessible"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False 