"""
Dashboard router for AMS Backend.
Handles dashboard-specific endpoints like statistics and bulk operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any

from database import get_db
from models import Bill, Component, Project, Staff, Location, Training, User
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin
from rate_limiting import rate_limit_api
from error_handlers import create_error_response

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_dashboard_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive dashboard statistics"""
    try:
        # Entity counts
        total_bills = db.query(Bill).count()
        total_components = db.query(Component).count()
        total_projects = db.query(Project).count()
        total_staff = db.query(Staff).count()
        total_locations = db.query(Location).count()
        total_training = db.query(Training).count()
        
        # Active counts
        active_bills = db.query(Bill).filter(Bill.status == "approved").count()
        active_components = db.query(Component).filter(Component.status == "Active").count()
        active_projects = db.query(Project).filter(Project.status == "Active").count()
        active_staff = db.query(Staff).filter(Staff.status == "active").count()
        active_training = db.query(Training).filter(Training.status == "active").count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_bills = db.query(Bill).filter(Bill.created_at >= thirty_days_ago).count()
        recent_components = db.query(Component).filter(Component.created_at >= thirty_days_ago).count()
        recent_projects = db.query(Project).filter(Project.created_at >= thirty_days_ago).count()
        recent_staff = db.query(Staff).filter(Staff.created_at >= thirty_days_ago).count()
        recent_training = db.query(Training).filter(Training.created_at >= thirty_days_ago).count()
        
        # Bill statistics
        pending_bills = db.query(Bill).filter(Bill.status == "pending").count()
        rejected_bills = db.query(Bill).filter(Bill.status == "rejected").count()
        
        # Component statistics by category
        component_categories = db.query(
            Component.category, 
            func.count(Component.id)
        ).group_by(Component.category).all()
        
        # Project statistics by status
        project_statuses = db.query(
            Project.status, 
            func.count(Project.id)
        ).group_by(Project.status).all()
        
        # Staff statistics by company
        staff_companies = db.query(
            Staff.company, 
            func.count(Staff.id)
        ).group_by(Staff.company).all()
        
        # Training statistics
        total_enrolled = db.query(func.sum(Training.enrolled_count)).scalar() or 0
        total_completed = db.query(func.sum(Training.completed_count)).scalar() or 0
        
        return {
            "overview": {
                "total_bills": total_bills,
                "active_bills": active_bills,
                "total_components": total_components,
                "active_components": active_components,
                "total_projects": total_projects,
                "active_projects": active_projects,
                "total_staff": total_staff,
                "active_staff": active_staff,
                "total_locations": total_locations,
                "total_training": total_training,
                "active_training": active_training
            },
            "recent_activity": {
                "recent_bills": recent_bills,
                "recent_components": recent_components,
                "recent_projects": recent_projects,
                "recent_staff": recent_staff,
                "recent_training": recent_training
            },
            "bills": {
                "pending": pending_bills,
                "approved": active_bills,
                "rejected": rejected_bills
            },
            "components_by_category": dict(component_categories),
            "projects_by_status": dict(project_statuses),
            "staff_by_company": dict(staff_companies),
            "training": {
                "total_enrolled": total_enrolled,
                "total_completed": total_completed
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve dashboard statistics",
                error_code="DASHBOARD_STATS_ERROR"
            )
        )

@router.get("/activity")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_recent_activity(
    request: Request,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get recent activity across all entities"""
    try:
        if days > 30:
            days = 30  # Limit to 30 days max
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get recent bills
        recent_bills = db.query(Bill).filter(
            Bill.created_at >= start_date
        ).order_by(Bill.created_at.desc()).limit(10).all()
        
        # Get recent components
        recent_components = db.query(Component).filter(
            Component.created_at >= start_date
        ).order_by(Component.created_at.desc()).limit(10).all()
        
        # Get recent projects
        recent_projects = db.query(Project).filter(
            Project.created_at >= start_date
        ).order_by(Project.created_at.desc()).limit(10).all()
        
        # Get recent staff
        recent_staff = db.query(Staff).filter(
            Staff.created_at >= start_date
        ).order_by(Staff.created_at.desc()).limit(10).all()
        
        # Get recent training
        recent_training = db.query(Training).filter(
            Training.created_at >= start_date
        ).order_by(Training.created_at.desc()).limit(10).all()
        
        return {
            "bills": [
                {
                    "id": bill.id,
                    "title": bill.title,
                    "status": bill.status,
                    "created_at": bill.created_at.isoformat(),
                    "vendor": bill.vendor
                } for bill in recent_bills
            ],
            "components": [
                {
                    "id": component.id,
                    "name": component.name,
                    "category": component.category,
                    "status": component.status,
                    "created_at": component.created_at.isoformat()
                } for component in recent_components
            ],
            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "status": project.status,
                    "created_at": project.created_at.isoformat()
                } for project in recent_projects
            ],
            "staff": [
                {
                    "id": staff.id,
                    "name": staff.name,
                    "department": staff.department,
                    "created_at": staff.created_at.isoformat()
                } for staff in recent_staff
            ],
            "training": [
                {
                    "id": training.id,
                    "name": training.name,
                    "institution": training.institution,
                    "status": training.status,
                    "created_at": training.created_at.isoformat()
                } for training in recent_training
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve recent activity",
                error_code="DASHBOARD_ACTIVITY_ERROR"
            )
        )

@router.get("/idle-assets")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_idle_assets(
    request: Request,
    days_threshold: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get assets that have been idle for a specified number of days"""
    try:
        if days_threshold > 365:
            days_threshold = 365  # Limit to 1 year max
        
        threshold_date = datetime.utcnow() - timedelta(days=days_threshold)
        
        # Get idle components (assuming last_used field exists or using created_at as proxy)
        idle_components = db.query(Component).filter(
            Component.status == "Idle"
        ).all()
        
        # For now, we'll use components with "Idle" status
        # In a real implementation, you'd have a last_used field
        idle_assets = []
        for component in idle_components:
            idle_assets.append({
                "id": component.id,
                "name": component.name,
                "type": "component",
                "category": component.category,
                "location": component.location,
                "status": component.status,
                "last_used": component.created_at.isoformat(),  # Placeholder
                "days_idle": (datetime.utcnow() - component.created_at).days
            })
        
        return {
            "idle_assets": idle_assets,
            "threshold_days": days_threshold,
            "total_idle": len(idle_assets)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve idle assets",
                error_code="DASHBOARD_IDLE_ASSETS_ERROR"
            )
        )

@router.get("/quick-actions")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_quick_actions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get available quick actions based on user role"""
    try:
        actions = []
        
        # Basic actions for all staff
        actions.extend([
            {
                "id": "add_asset",
                "title": "Add New Asset",
                "description": "Register a new component or equipment",
                "icon": "plus",
                "route": "/items",
                "requires_role": "staff"
            },
            {
                "id": "view_reports",
                "title": "View Reports",
                "description": "Access system reports and analytics",
                "icon": "chart",
                "route": "/dashboard",
                "requires_role": "staff"
            }
        ])
        
        # Manager/Admin actions
        if current_user.role in ['manager', 'admin']:
            actions.extend([
                {
                    "id": "schedule_maintenance",
                    "title": "Schedule Maintenance",
                    "description": "Schedule maintenance for assets",
                    "icon": "wrench",
                    "route": "/maintenance",
                    "requires_role": "manager"
                },
                {
                    "id": "assign_asset",
                    "title": "Assign Asset",
                    "description": "Assign assets to team members",
                    "icon": "users",
                    "route": "/assignments",
                    "requires_role": "manager"
                },
                {
                    "id": "approve_bills",
                    "title": "Approve Bills",
                    "description": "Review and approve pending bills",
                    "icon": "check",
                    "route": "/bills",
                    "requires_role": "manager"
                }
            ])
        
        # Admin-only actions
        if current_user.role == 'admin':
            actions.extend([
                {
                    "id": "user_management",
                    "title": "User Management",
                    "description": "Manage system users and permissions",
                    "icon": "settings",
                    "route": "/users",
                    "requires_role": "admin"
                },
                {
                    "id": "system_settings",
                    "title": "System Settings",
                    "description": "Configure system parameters",
                    "icon": "gear",
                    "route": "/settings",
                    "requires_role": "admin"
                }
            ])
        
        return {
            "actions": actions,
            "user_role": current_user.role
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve quick actions",
                error_code="DASHBOARD_QUICK_ACTIONS_ERROR"
            )
        )

@router.get("/alerts")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_dashboard_alerts(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get system alerts and notifications"""
    try:
        alerts = []
        
        # Check for pending bills (for managers/admins)
        if current_user.role in ['manager', 'admin']:
            pending_bills_count = db.query(Bill).filter(Bill.status == "pending").count()
            if pending_bills_count > 0:
                alerts.append({
                    "id": "pending_bills",
                    "type": "warning",
                    "title": f"{pending_bills_count} Pending Bills",
                    "message": f"You have {pending_bills_count} bills awaiting approval",
                    "action": "Review bills",
                    "route": "/bills"
                })
        
        # Check for idle assets
        idle_components = db.query(Component).filter(Component.status == "Idle").count()
        if idle_components > 0:
            alerts.append({
                "id": "idle_assets",
                "type": "info",
                "title": f"{idle_components} Idle Assets",
                "message": f"You have {idle_components} assets that are currently idle",
                "action": "View idle assets",
                "route": "/items"
            })
        
        # Check for low capacity training courses
        low_capacity_training = db.query(Training).filter(
            Training.max_capacity.isnot(None),
            Training.enrolled_count >= Training.max_capacity * 0.9
        ).count()
        
        if low_capacity_training > 0:
            alerts.append({
                "id": "low_capacity_training",
                "type": "info",
                "title": f"{low_capacity_training} Training Courses Near Capacity",
                "message": f"{low_capacity_training} training courses are nearly full",
                "action": "View training",
                "route": "/training"
            })
        
        return {
            "alerts": alerts,
            "total_alerts": len(alerts)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve dashboard alerts",
                error_code="DASHBOARD_ALERTS_ERROR"
            )
        ) 