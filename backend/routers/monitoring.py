"""
Monitoring router for AMS Backend.
Provides endpoints for health checks, performance metrics, and system monitoring.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
import psutil
import os
from datetime import datetime

from database import get_db
from models import User
from auth import get_current_active_user
from middleware import require_admin
from services.monitoring import monitoring_service
from services.cache_service import cache_service, CacheKeys
from rate_limiting import rate_limit_api

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])

@router.get("/health")
@rate_limit_api("1000/minute")
def health_check(request: Request):
    """Comprehensive health check endpoint"""
    try:
        # Basic system health
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "checks": {
                "database": "healthy",
                "redis": "healthy",
                "memory": "healthy",
                "cpu": "healthy"
            }
        }
        
        # Check database health
        try:
            db = next(get_db())
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
            db.close()
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        
        # Check Redis/cache health
        try:
            cache_service.get("health_check")
            cache_service.set("health_check", "ok", 60)
        except Exception as e:
            health_status["checks"]["redis"] = f"unhealthy: {str(e)}"
        
        # Check system resources
        try:
            memory = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=1)
            
            if memory.percent > 90:
                health_status["checks"]["memory"] = "warning: high memory usage"
            if cpu_percent > 90:
                health_status["checks"]["cpu"] = "warning: high CPU usage"
                
            health_status["system"] = {
                "memory_usage_percent": memory.percent,
                "cpu_usage_percent": cpu_percent,
                "disk_usage_percent": psutil.disk_usage('/').percent
            }
        except Exception as e:
            health_status["checks"]["system"] = f"unhealthy: {str(e)}"
        
        return health_status
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )

@router.get("/metrics")
@require_admin
@rate_limit_api("100/minute")
def get_performance_metrics(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """Get performance metrics and statistics"""
    try:
        # Get performance stats
        performance_stats = monitoring_service.get_performance_stats()
        
        # Get cache stats
        cache_stats = cache_service.get_stats()
        
        # Get system info
        system_info = {
            "memory": {
                "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                "available_gb": round(psutil.virtual_memory().available / (1024**3), 2),
                "used_percent": psutil.virtual_memory().percent
            },
            "cpu": {
                "count": psutil.cpu_count(),
                "usage_percent": psutil.cpu_percent(interval=1)
            },
            "disk": {
                "total_gb": round(psutil.disk_usage('/').total / (1024**3), 2),
                "used_gb": round(psutil.disk_usage('/').used / (1024**3), 2),
                "free_gb": round(psutil.disk_usage('/').free / (1024**3), 2),
                "usage_percent": psutil.disk_usage('/').percent
            }
        }
        
        return {
            "performance": performance_stats,
            "cache": cache_stats,
            "system": system_info,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )

@router.get("/errors")
@require_admin
@rate_limit_api("100/minute")
def get_error_summary(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """Get error summary and recent errors"""
    try:
        error_summary = monitoring_service.get_error_summary()
        return {
            "errors": error_summary,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get error summary: {str(e)}"
        )

@router.post("/cache/clear")
@require_admin
@rate_limit_api("10/minute")
def clear_cache(
    request: Request,
    pattern: str = "*",
    current_user: User = Depends(get_current_active_user)
):
    """Clear cache entries matching pattern"""
    try:
        deleted_count = cache_service.delete_pattern(pattern)
        
        return {
            "message": f"Cleared {deleted_count} cache entries",
            "pattern": pattern,
            "deleted_count": deleted_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )

@router.get("/cache/stats")
@require_admin
@rate_limit_api("100/minute")
def get_cache_stats(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed cache statistics"""
    try:
        cache_stats = cache_service.get_stats()
        
        return {
            "cache": cache_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache stats: {str(e)}"
        )

@router.get("/system/info")
@require_admin
@rate_limit_api("100/minute")
def get_system_info(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed system information"""
    try:
        # Process information
        process = psutil.Process()
        
        # Network information
        network_io = psutil.net_io_counters()
        
        system_info = {
            "process": {
                "pid": process.pid,
                "name": process.name(),
                "memory_info": {
                    "rss_mb": round(process.memory_info().rss / (1024**2), 2),
                    "vms_mb": round(process.memory_info().vms / (1024**2), 2)
                },
                "cpu_percent": process.cpu_percent(),
                "num_threads": process.num_threads(),
                "create_time": datetime.fromtimestamp(process.create_time()).isoformat()
            },
            "system": {
                "platform": os.name,
                "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
                "cpu_count": psutil.cpu_count(),
                "cpu_freq": {
                    "current_mhz": psutil.cpu_freq().current if psutil.cpu_freq() else None,
                    "min_mhz": psutil.cpu_freq().min if psutil.cpu_freq() else None,
                    "max_mhz": psutil.cpu_freq().max if psutil.cpu_freq() else None
                }
            },
            "network": {
                "bytes_sent": network_io.bytes_sent,
                "bytes_recv": network_io.bytes_recv,
                "packets_sent": network_io.packets_sent,
                "packets_recv": network_io.packets_recv
            },
            "environment": {
                "environment": os.getenv("ENVIRONMENT", "development"),
                "debug": os.getenv("DEBUG", "false").lower() == "true"
            }
        }
        
        return {
            "system_info": system_info,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system info: {str(e)}"
        ) 