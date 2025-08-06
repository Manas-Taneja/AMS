"""
Locations router for AMS Backend.
Handles location CRUD operations with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from database import get_db
from models import Location, User
from schemas import LocationCreate, LocationUpdate, Location as LocationSchema
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin, require_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError, create_error_response

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("/", response_model=list[LocationSchema])
@require_staff_or_above
@rate_limit_search("30/minute")
def get_locations(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get locations with optional search"""
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
        locations = query.offset(skip).limit(limit).all()
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve locations",
                error_code="LOCATIONS_RETRIEVAL_ERROR"
            )
        )

@router.get("/{location_id}", response_model=LocationSchema)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_location(
    request: Request, 
    location_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific location by ID"""
    try:
        if location_id <= 0:
            raise ValidationError("Invalid location ID")
        
        location = db.query(Location).filter(Location.id == location_id).first()
        if location is None:
            raise NotFoundError("Location", location_id)
        
        return location
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
                message="Failed to retrieve location",
                error_code="LOCATION_RETRIEVAL_ERROR"
            )
        )

@router.post("/", response_model=LocationSchema)
@require_manager_or_admin
@rate_limit_create("20/minute")
def create_location(
    request: Request,
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new location"""
    try:
        # Validate required fields
        if not location.name or not location.name.strip():
            raise ValidationError("Location name is required")
        
        if not location.address or not location.address.strip():
            raise ValidationError("Location address is required")
        
        if not location.manager or not location.manager.strip():
            raise ValidationError("Location manager is required")
        
        if not location.project or not location.project.strip():
            raise ValidationError("Location project is required")
        
        if location.team <= 0:
            raise ValidationError("Team number must be greater than 0")
        
        # Generate avatar from manager name if not provided
        location_data = location.dict()
        if not location_data.get('avatar') and location_data.get('manager'):
            manager_name = location_data['manager']
            initials = ''.join([name[0].upper() for name in manager_name.split() if name])
            location_data['avatar'] = initials[:2]  # Take first 2 initials
        
        # Set pointOfContact to manager if not provided
        if not location_data.get('pointOfContact'):
            location_data['pointOfContact'] = location_data.get('manager', '')
        
        db_location = Location(**location_data)
        db.add(db_location)
        db.commit()
        db.refresh(db_location)
        return db_location
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
                message="Failed to create location",
                error_code="LOCATION_CREATION_ERROR"
            )
        )

@router.put("/{location_id}", response_model=LocationSchema)
@require_manager_or_admin
@rate_limit_update("30/minute")
def update_location(
    request: Request,
    location_id: int,
    location: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a location"""
    try:
        if location_id <= 0:
            raise ValidationError("Invalid location ID")
        
        db_location = db.query(Location).filter(Location.id == location_id).first()
        if db_location is None:
            raise NotFoundError("Location", location_id)
        
        update_data = location.dict(exclude_unset=True)
        
        # Validate non-empty strings for required fields
        for field, value in update_data.items():
            if isinstance(value, str) and not value.strip() and field not in ['pointOfContact', 'avatar']:
                raise ValidationError(f"{field} cannot be empty")
        
        # Generate avatar from manager name if manager is updated and avatar is not provided
        if 'manager' in update_data and not update_data.get('avatar'):
            manager_name = update_data['manager']
            initials = ''.join([name[0].upper() for name in manager_name.split() if name])
            update_data['avatar'] = initials[:2]  # Take first 2 initials
        
        # Set pointOfContact to manager if manager is updated and pointOfContact is not provided
        if 'manager' in update_data and not update_data.get('pointOfContact'):
            update_data['pointOfContact'] = update_data['manager']
        
        for field, value in update_data.items():
            setattr(db_location, field, value)
        
        db.commit()
        db.refresh(db_location)
        return db_location
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
                message="Failed to update location",
                error_code="LOCATION_UPDATE_ERROR"
            )
        )

@router.delete("/{location_id}")
@require_admin
@rate_limit_delete("10/minute")
def delete_location(
    request: Request,
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a location"""
    try:
        if location_id <= 0:
            raise ValidationError("Invalid location ID")
        
        db_location = db.query(Location).filter(Location.id == location_id).first()
        if db_location is None:
            raise NotFoundError("Location", location_id)
        
        db.delete(db_location)
        db.commit()
        return {"message": "Location deleted successfully"}
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
                message="Failed to delete location",
                error_code="LOCATION_DELETION_ERROR"
            )
        ) 