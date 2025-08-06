"""
Export router for AMS Backend.
Handles CSV/Excel exports of all entities with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import csv
import io
import json
from datetime import datetime

from database import get_db
from models import Bill, Component, Project, Staff, Location, Training, User
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin
from rate_limiting import rate_limit_api
from error_handlers import ValidationError, create_error_response

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.get("/bills")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_bills(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    status: Optional[str] = Query(None, max_length=20, description="Filter by status"),
    category: Optional[str] = Query(None, max_length=50, description="Filter by category"),
    vendor: Optional[str] = Query(None, max_length=100, description="Filter by vendor"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export bills to CSV or JSON"""
    try:
        query = db.query(Bill)
        
        # Apply filters
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Bill.title.ilike(f"%{search_term}%"),
                    Bill.vendor.ilike(f"%{search_term}%"),
                    Bill.description.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        if status:
            query = query.filter(Bill.status == status.strip())
        
        if category:
            query = query.filter(Bill.category == category.strip())
        
        if vendor:
            query = query.filter(Bill.vendor.ilike(f"%{vendor.strip()}%"))
        
        # If user is not admin, only show their own bills or approved bills
        if current_user.role not in ['admin', 'manager']:
            query = query.filter(
                (Bill.uploaded_by == current_user.id) | 
                (Bill.status == 'approved')
            )
        
        bills = query.order_by(Bill.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(bills, "bills")
        else:
            return export_to_json(bills, "bills")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export bills",
                error_code="BILLS_EXPORT_ERROR"
            )
        )

@router.get("/components")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_components(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    category: Optional[str] = Query(None, max_length=50, description="Filter by category"),
    status: Optional[str] = Query(None, max_length=20, description="Filter by status"),
    owner: Optional[str] = Query(None, max_length=50, description="Filter by owner"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export components to CSV or JSON"""
    try:
        query = db.query(Component)
        
        # Apply filters
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Component.name.ilike(f"%{search_term}%"),
                    Component.category.ilike(f"%{search_term}%"),
                    Component.project.ilike(f"%{search_term}%"),
                    Component.location.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        if category:
            query = query.filter(Component.category == category.strip())
        
        if status:
            query = query.filter(Component.status == status.strip())
        
        if owner:
            query = query.filter(Component.owner == owner.strip())
        
        components = query.order_by(Component.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(components, "components")
        else:
            return export_to_json(components, "components")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export components",
                error_code="COMPONENTS_EXPORT_ERROR"
            )
        )

@router.get("/projects")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_projects(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export projects to CSV or JSON"""
    try:
        query = db.query(Project)
        
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Project.name.ilike(f"%{search_term}%"),
                    Project.category.ilike(f"%{search_term}%"),
                    Project.funding_type.ilike(f"%{search_term}%"),
                    Project.funding_body.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        projects = query.order_by(Project.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(projects, "projects")
        else:
            return export_to_json(projects, "projects")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export projects",
                error_code="PROJECTS_EXPORT_ERROR"
            )
        )

@router.get("/staff")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_staff(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    company: Optional[str] = Query(None, max_length=50, description="Filter by company"),
    designation: Optional[str] = Query(None, max_length=50, description="Filter by designation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export staff to CSV or JSON"""
    try:
        query = db.query(Staff)
        
        # Apply filters
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Staff.name.ilike(f"%{search_term}%"),
                    Staff.email.ilike(f"%{search_term}%"),
                    Staff.phone.ilike(f"%{search_term}%"),
                    Staff.department.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        if company:
            query = query.filter(Staff.company == company.strip())
        
        if designation:
            query = query.filter(Staff.designation == designation.strip())
        
        staff = query.order_by(Staff.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(staff, "staff")
        else:
            return export_to_json(staff, "staff")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export staff",
                error_code="STAFF_EXPORT_ERROR"
            )
        )

@router.get("/locations")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_locations(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export locations to CSV or JSON"""
    try:
        query = db.query(Location)
        
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Location.name.ilike(f"%{search_term}%"),
                    Location.address.ilike(f"%{search_term}%"),
                    Location.manager.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        locations = query.order_by(Location.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(locations, "locations")
        else:
            return export_to_json(locations, "locations")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export locations",
                error_code="LOCATIONS_EXPORT_ERROR"
            )
        )

@router.get("/training")
@require_staff_or_above
@rate_limit_api("10/minute")
def export_training(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    level: Optional[str] = Query(None, max_length=50, description="Filter by level"),
    category: Optional[str] = Query(None, max_length=100, description="Filter by category"),
    status: Optional[str] = Query(None, max_length=50, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export training courses to CSV or JSON"""
    try:
        query = db.query(Training)
        
        # Apply filters
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Training.name.ilike(f"%{search_term}%"),
                    Training.description.ilike(f"%{search_term}%"),
                    Training.institution.ilike(f"%{search_term}%"),
                    Training.instructor_name.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        if level:
            query = query.filter(Training.level == level.strip())
        
        if category:
            query = query.filter(Training.category == category.strip())
        
        if status:
            query = query.filter(Training.status == status.strip())
        
        training_courses = query.order_by(Training.created_at.desc()).all()
        
        if format == "csv":
            return export_to_csv(training_courses, "training")
        else:
            return export_to_json(training_courses, "training")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export training courses",
                error_code="TRAINING_EXPORT_ERROR"
            )
        )

@router.get("/dashboard")
@require_manager_or_admin
@rate_limit_api("5/minute")
def export_dashboard_report(
    request: Request,
    format: str = Query("csv", regex="^(csv|json)$", description="Export format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export comprehensive dashboard report"""
    try:
        # Get counts for all entities
        bills_count = db.query(Bill).count()
        components_count = db.query(Component).count()
        projects_count = db.query(Project).count()
        staff_count = db.query(Staff).count()
        locations_count = db.query(Location).count()
        training_count = db.query(Training).count()
        
        # Get active counts
        active_bills = db.query(Bill).filter(Bill.status == "approved").count()
        active_components = db.query(Component).filter(Component.status == "Active").count()
        active_projects = db.query(Project).filter(Project.status == "Active").count()
        active_staff = db.query(Staff).filter(Staff.status == "active").count()
        active_training = db.query(Training).filter(Training.status == "active").count()
        
        # Create dashboard data
        dashboard_data = {
            "total_bills": bills_count,
            "active_bills": active_bills,
            "total_components": components_count,
            "active_components": active_components,
            "total_projects": projects_count,
            "active_projects": active_projects,
            "total_staff": staff_count,
            "active_staff": active_staff,
            "total_locations": locations_count,
            "total_training": training_count,
            "active_training": active_training,
            "export_date": datetime.utcnow().isoformat(),
            "exported_by": current_user.username
        }
        
        if format == "csv":
            return export_dashboard_to_csv(dashboard_data)
        else:
            return export_to_json([dashboard_data], "dashboard")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to export dashboard report",
                error_code="DASHBOARD_EXPORT_ERROR"
            )
        )

def export_to_csv(data, entity_name):
    """Helper function to export data to CSV"""
    if not data:
        raise ValidationError(f"No {entity_name} data to export")
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    if data:
        headers = list(data[0].__dict__.keys())
        # Remove SQLAlchemy internal attributes
        headers = [h for h in headers if not h.startswith('_')]
        writer.writerow(headers)
        
        # Write data
        for item in data:
            row = []
            for header in headers:
                value = getattr(item, header, '')
                if isinstance(value, datetime):
                    value = value.isoformat()
                row.append(str(value) if value is not None else '')
            writer.writerow(row)
    
    output.seek(0)
    
    filename = f"{entity_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def export_to_json(data, entity_name):
    """Helper function to export data to JSON"""
    if not data:
        raise ValidationError(f"No {entity_name} data to export")
    
    # Convert SQLAlchemy objects to dictionaries
    json_data = []
    for item in data:
        item_dict = {}
        for key, value in item.__dict__.items():
            if not key.startswith('_'):
                if isinstance(value, datetime):
                    item_dict[key] = value.isoformat()
                else:
                    item_dict[key] = value
        json_data.append(item_dict)
    
    filename = f"{entity_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    
    return StreamingResponse(
        io.BytesIO(json.dumps(json_data, indent=2, default=str).encode('utf-8')),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def export_dashboard_to_csv(dashboard_data):
    """Helper function to export dashboard data to CSV"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Metric", "Value"])
    
    # Write data
    for key, value in dashboard_data.items():
        writer.writerow([key.replace('_', ' ').title(), value])
    
    output.seek(0)
    
    filename = f"dashboard_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    ) 