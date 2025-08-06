"""
Components router for AMS Backend.
Handles component CRUD operations with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from database import get_db
from models import Component, User
from schemas import ComponentCreate, ComponentUpdate, Component as ComponentSchema
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin, require_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError, create_error_response

router = APIRouter(prefix="/api/components", tags=["Components"])

@router.get("/", response_model=list[ComponentSchema])
@require_staff_or_above
@rate_limit_search("30/minute")
def get_components(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    category: Optional[str] = Query(None, max_length=50, description="Filter by category"),
    status: Optional[str] = Query(None, max_length=20, description="Filter by status"),
    owner: Optional[str] = Query(None, max_length=50, description="Filter by owner"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get components with optional filtering and search"""
    try:
        query = db.query(Component)
        
        # Apply search filter
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
        
        # Apply filters
        if category:
            query = query.filter(Component.category == category.strip())
        
        if status:
            query = query.filter(Component.status == status.strip())
        
        if owner:
            query = query.filter(Component.owner == owner.strip())
        
        components = query.offset(skip).limit(limit).all()
        return components
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve components",
                error_code="COMPONENTS_RETRIEVAL_ERROR"
            )
        )

@router.get("/{component_id}", response_model=ComponentSchema)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_component(
    request: Request, 
    component_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific component by ID"""
    try:
        if component_id <= 0:
            raise ValidationError("Invalid component ID")
        
        component = db.query(Component).filter(Component.id == component_id).first()
        if component is None:
            raise NotFoundError("Component", component_id)
        
        return component
        
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
                message="Failed to retrieve component",
                error_code="COMPONENT_RETRIEVAL_ERROR"
            )
        )

@router.post("/", response_model=ComponentSchema)
@require_manager_or_admin
@rate_limit_create("20/minute")
def create_component(
    request: Request,
    component: ComponentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new component"""
    try:
        # Validate required fields
        if not component.name or not component.name.strip():
            raise ValidationError("Component name is required")
        
        if not component.category or not component.category.strip():
            raise ValidationError("Component category is required")
        
        if not component.status or not component.status.strip():
            raise ValidationError("Component status is required")
        
        if not component.location or not component.location.strip():
            raise ValidationError("Component location is required")
        
        if not component.project or not component.project.strip():
            raise ValidationError("Component project is required")
        
        if not component.owner or not component.owner.strip():
            raise ValidationError("Component owner is required")
        
        db_component = Component(**component.dict())
        db.add(db_component)
        db.commit()
        db.refresh(db_component)
        return db_component
        
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
                message="Failed to create component",
                error_code="COMPONENT_CREATION_ERROR"
            )
        )

@router.put("/{component_id}", response_model=ComponentSchema)
@require_manager_or_admin
@rate_limit_update("30/minute")
def update_component(
    request: Request,
    component_id: int, 
    component: ComponentUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a component"""
    try:
        if component_id <= 0:
            raise ValidationError("Invalid component ID")
        
        db_component = db.query(Component).filter(Component.id == component_id).first()
        if db_component is None:
            raise NotFoundError("Component", component_id)
        
        update_data = component.dict(exclude_unset=True)
        
        # Validate non-empty strings for required fields
        for field, value in update_data.items():
            if isinstance(value, str) and not value.strip():
                raise ValidationError(f"{field} cannot be empty")
        
        for field, value in update_data.items():
            setattr(db_component, field, value)
        
        db.commit()
        db.refresh(db_component)
        return db_component
        
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
                message="Failed to update component",
                error_code="COMPONENT_UPDATE_ERROR"
            )
        )

@router.delete("/{component_id}")
@require_admin
@rate_limit_delete("10/minute")
def delete_component(
    request: Request,
    component_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a component"""
    try:
        if component_id <= 0:
            raise ValidationError("Invalid component ID")
        
        db_component = db.query(Component).filter(Component.id == component_id).first()
        if db_component is None:
            raise NotFoundError("Component", component_id)
        
        db.delete(db_component)
        db.commit()
        return {"message": "Component deleted successfully"}
        
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
                message="Failed to delete component",
                error_code="COMPONENT_DELETION_ERROR"
            )
        )

# Component metadata endpoints
@router.get("/categories")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_component_categories(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all component categories"""
    try:
        categories = db.query(Component.category).distinct().all()
        return [category[0] for category in categories if category[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve component categories",
                error_code="CATEGORIES_RETRIEVAL_ERROR"
            )
        )

@router.get("/owners")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_component_owners(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all component owners"""
    try:
        owners = db.query(Component.owner).distinct().all()
        return [owner[0] for owner in owners if owner[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve component owners",
                error_code="OWNERS_RETRIEVAL_ERROR"
            )
        )

@router.get("/statuses")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_component_statuses(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all component statuses"""
    try:
        statuses = db.query(Component.status).distinct().all()
        return [status[0] for status in statuses if status[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve component statuses",
                error_code="STATUSES_RETRIEVAL_ERROR"
            )
        ) 