"""
Projects router for AMS Backend.
Handles project CRUD operations with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from database import get_db
from models import Project, User
from schemas import ProjectCreate, ProjectUpdate, Project as ProjectSchema
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin, require_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError, create_error_response

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("/", response_model=list[ProjectSchema])
@require_staff_or_above
@rate_limit_search("30/minute")
def get_projects(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get projects with optional search"""
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
        projects = query.offset(skip).limit(limit).all()
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve projects",
                error_code="PROJECTS_RETRIEVAL_ERROR"
            )
        )

@router.get("/{project_id}", response_model=ProjectSchema)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_project(
    request: Request, 
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific project by ID"""
    try:
        if project_id <= 0:
            raise ValidationError("Invalid project ID")
        
        project = db.query(Project).filter(Project.id == project_id).first()
        if project is None:
            raise NotFoundError("Project", project_id)
        
        return project
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve project",
                error_code="PROJECT_RETRIEVAL_ERROR"
            )
        )

@router.post("/", response_model=ProjectSchema)
@require_admin
@rate_limit_create("20/minute")
def create_project(
    request: Request,
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new project"""
    try:
        # Validate required fields
        if not project.name or not project.name.strip():
            raise ValidationError("Project name is required")
        
        if not project.status or not project.status.strip():
            raise ValidationError("Project status is required")
        
        if project.progress < 0 or project.progress > 100:
            raise ValidationError("Project progress must be between 0 and 100")
        
        db_project = Project(**project.dict())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except ValidationError as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code="VALIDATION_ERROR"
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to create project",
                error_code="PROJECT_CREATION_ERROR"
            )
        )

@router.put("/{project_id}", response_model=ProjectSchema)
@require_manager_or_admin
@rate_limit_update("30/minute")
def update_project(
    request: Request,
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a project"""
    try:
        if project_id <= 0:
            raise ValidationError("Invalid project ID")
        
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if db_project is None:
            raise NotFoundError("Project", project_id)
        
        update_data = project.dict(exclude_unset=True)
        
        # Validate non-empty strings for required fields
        for field, value in update_data.items():
            if isinstance(value, str) and not value.strip():
                raise ValidationError(f"{field} cannot be empty")
        
        # Validate progress range
        if 'progress' in update_data and (update_data['progress'] < 0 or update_data['progress'] > 100):
            raise ValidationError("Project progress must be between 0 and 100")
        
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        db.commit()
        db.refresh(db_project)
        return db_project
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to update project",
                error_code="PROJECT_UPDATE_ERROR"
            )
        )

@router.delete("/{project_id}")
@require_admin
@rate_limit_delete("10/minute")
def delete_project(
    request: Request,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a project"""
    try:
        if project_id <= 0:
            raise ValidationError("Invalid project ID")
        
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if db_project is None:
            raise NotFoundError("Project", project_id)
        
        db.delete(db_project)
        db.commit()
        return {"message": "Project deleted successfully"}
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=e.status_code, detail=create_error_response(
            status_code=e.status_code,
            message=e.message,
            error_code=type(e).__name__.upper()
        ))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to delete project",
                error_code="PROJECT_DELETION_ERROR"
            )
        ) 