# Import logging configuration first
from logging_config import get_logger

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from middleware import require_admin, require_manager_or_admin, require_staff_or_above
from security import SecurityHeadersMiddleware
from rate_limiting import (
    limiter, 
    rate_limit_api, 
    create_rate_limited_response
)
from slowapi.errors import RateLimitExceeded
from error_handlers import register_exception_handlers

# Get logger for this module
logger = get_logger(__name__)

from database import engine, get_db, check_database_health
from models import Base, User
from auth import get_current_active_user
from config import settings

# Import OAuth manager
from oauth_manager import oauth_state_manager

# Import monitoring and caching services
from monitoring_middleware.monitoring_middleware import MonitoringMiddleware, ErrorHandlingMiddleware
from services.monitoring import monitoring_service
from services.cache_service import cache_service

# Import routers
from routers import auth, components, locations, projects, staff, bills, oauth, files, training, export, dashboard, monitoring

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AMS Backend", version="1.0.0")

# Add rate limiter to app state
app.state.limiter = limiter

# Register all exception handlers
register_exception_handlers(app)

# Add monitoring middleware (must be first)
app.add_middleware(MonitoringMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(components.router)
app.include_router(locations.router)
app.include_router(projects.router)
app.include_router(staff.router)
app.include_router(bills.router)
app.include_router(oauth.router)
app.include_router(files.router)
app.include_router(training.router)
app.include_router(export.router)
app.include_router(dashboard.router)
app.include_router(monitoring.router)

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "AMS Backend is running!"}

@app.get("/api/hello")
def hello():
    """Hello endpoint"""
    return {"message": "Hello from AMS Backend!"}

@app.get("/api/health")
@rate_limit_api("1000/minute")
def health_check(request: Request):
    """Comprehensive health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": settings.environment,
        "checks": {
            "database": "healthy",
            "redis": "healthy",
            "oauth": "healthy"
        }
    }
    
    # Check database health
    if not check_database_health():
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = "unhealthy"
    
    # Check Redis health
    if not oauth_state_manager.is_redis_available():
        health_status["checks"]["redis"] = "unhealthy"
        health_status["checks"]["oauth"] = "degraded"
    
    # Check OAuth configuration
    if settings.google_client_id == "your-google-client-id":
        health_status["checks"]["oauth"] = "not_configured"
    
    return health_status 