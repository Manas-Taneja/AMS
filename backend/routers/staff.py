"""
Staff router for AMS Backend.
Handles staff CRUD operations with proper error handling.
"""

from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import traceback

from database import get_db
from models import Staff, User
from schemas import StaffCreate, StaffUpdate, Staff as StaffSchema
from auth import get_current_active_user_hybrid
from middleware import require_staff_or_above, require_manager_or_admin, require_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError
from response_utils import (
    success_response, 
    created_response, 
    updated_response, 
    deleted_response,
    not_found_response,
    validation_error_response,
    internal_error_response
)
from logging_config import get_logger

# Get logger for this module
logger = get_logger(__name__)

router = APIRouter(prefix="/api/staff", tags=["Staff"])

@router.get("/", response_model=dict)
@require_staff_or_above
@rate_limit_search("30/minute")
def get_staff(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    company: Optional[str] = Query(None, max_length=50, description="Filter by company"),
    designation: Optional[str] = Query(None, max_length=50, description="Filter by designation"),
    skill: Optional[str] = Query(None, max_length=50, description="Filter by skill"),
    availability: Optional[str] = Query(None, max_length=20, description="Filter by availability"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_hybrid)
):
    """Get staff with optional filtering and search"""
    try:
        query = db.query(Staff)
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Staff.name.ilike(f"%{search_term}%"),
                    Staff.email.ilike(f"%{search_term}%"),
                    Staff.phone.ilike(f"%{search_term}%"),
                    Staff.designation.ilike(f"%{search_term}%"),
                    Staff.skills.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        if company:
            query = query.filter(Staff.company == company.strip())
        
        if designation:
            query = query.filter(Staff.designation == designation.strip())
        
        if skill:
            skill_term = skill.strip()
            if skill_term:
                query = query.filter(Staff.skills.ilike(f"%{skill_term}%"))
        
        if availability:
            query = query.filter(Staff.availability == availability.strip())
        
        staff = query.offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(staff)} staff records from database")
        
        # Convert skills from comma-separated string to list
        staff_data = []
        for s in staff:
            try:
                logger.debug(f"Processing staff member: {s.name}, skills: {s.skills}")
                skills_list = []
                if s.skills:
                    if isinstance(s.skills, str):
                        skills_list = [sk.strip() for sk in s.skills.split(",") if sk.strip()]
                    else:
                        logger.warning(f"Skills field is not a string for staff {s.name}: {type(s.skills)}")
                        skills_list = []
                else:
                    logger.debug(f"No skills for staff member {s.name}")
                
                staff_schema = StaffSchema(
                    id=s.id,
                    name=s.name,
                    email=s.email,
                    phone=s.phone,
                    department=s.department,
                    status=s.status,
                    designation=s.designation,
                    skills=skills_list,
                    location=s.location,
                    availability=s.availability,
                    project=s.project,
                    company=s.company,
                    reports_to=s.reports_to,
                    experience=s.experience,
                    joinDate=s.joinDate,
                    created_at=s.created_at,
                    updated_at=s.updated_at
                )
                staff_data.append(staff_schema)
            except Exception as staff_error:
                logger.error(f"Error processing staff member {s.name}: {staff_error}")
                logger.error(traceback.format_exc())
                continue
        
        logger.info(f"Successfully processed {len(staff_data)} staff members")
        
        # Convert Pydantic models to dictionaries for JSON serialization
        staff_data_dict = [staff.model_dump(mode='json') for staff in staff_data]
        
        return success_response(
            data=staff_data_dict,
            message=f"Retrieved {len(staff_data)} staff members"
        )
    except Exception as e:
        logger.error(f"Error in get_staff: {e}")
        logger.error(traceback.format_exc())
        return internal_error_response(
            message="Failed to retrieve staff",
            error_code="STAFF_RETRIEVAL_ERROR"
        )

@router.get("/{staff_id}", response_model=dict)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_staff_member(
    request: Request, 
    staff_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user_hybrid)
):
    """Get a specific staff member by ID"""
    try:
        if staff_id <= 0:
            raise ValidationError("Invalid staff ID")
        
        s = db.query(Staff).filter(Staff.id == staff_id).first()
        if s is None:
            raise NotFoundError("Staff member", staff_id)
        
        staff_data = StaffSchema(
            id=s.id,
            name=s.name,
            email=s.email,
            phone=s.phone,
            department=s.department,
            status=s.status,
            designation=s.designation,
            skills=[sk.strip() for sk in s.skills.split(",") if sk.strip()],
            location=s.location,
            availability=s.availability,
            project=s.project,
            company=s.company,
            reports_to=s.reports_to,
            experience=s.experience,
            joinDate=s.joinDate,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        
        # Convert Pydantic model to dictionary for JSON serialization
        staff_data_dict = staff_data.model_dump(mode='json')
        
        return success_response(
            data=staff_data_dict,
            message="Staff member retrieved successfully"
        )
    except ValidationError as e:
        return validation_error_response(
            message=e.message,
            error_code="VALIDATION_ERROR"
        )
    except NotFoundError as e:
        return not_found_response(
            resource="Staff member",
            resource_id=staff_id,
            error_code="NOT_FOUND_ERROR"
        )
    except Exception as e:
        return internal_error_response(
            message="Failed to retrieve staff member",
            error_code="STAFF_MEMBER_RETRIEVAL_ERROR"
        )

@router.post("/", response_model=dict)
@require_admin
@rate_limit_create("20/minute")
def create_staff(
    request: Request,
    staff: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_hybrid)
):
    """Create a new staff member"""
    try:
        # Validate required fields
        if not staff.name or not staff.name.strip():
            raise ValidationError("Staff name is required")
        
        if not staff.email or not staff.email.strip():
            raise ValidationError("Staff email is required")
        
        if not staff.department or not staff.department.strip():
            raise ValidationError("Staff department is required")
        
        if not staff.designation or not staff.designation.strip():
            raise ValidationError("Staff designation is required")
        
        if not staff.skills or len(staff.skills) == 0:
            raise ValidationError("Staff skills are required")
        
        if not staff.location or not staff.location.strip():
            raise ValidationError("Staff location is required")
        
        if not staff.availability or not staff.availability.strip():
            raise ValidationError("Staff availability is required")
        
        if not staff.project or not staff.project.strip():
            raise ValidationError("Staff project is required")
        
        if not staff.company or not staff.company.strip():
            raise ValidationError("Staff company is required")
        
        db_staff = Staff(
            name=staff.name,
            email=staff.email,
            phone=staff.phone,
            department=staff.department,
            status=staff.status,
            designation=staff.designation,
            skills=",".join(staff.skills),
            location=staff.location,
            availability=staff.availability,
            project=staff.project,
            company=staff.company,
            reports_to=staff.reports_to,
            experience=staff.experience,
            joinDate=staff.joinDate
        )
        db.add(db_staff)
        db.commit()
        db.refresh(db_staff)
        
        staff_data = StaffSchema(
            id=db_staff.id,
            name=db_staff.name,
            email=db_staff.email,
            phone=db_staff.phone,
            department=db_staff.department,
            status=db_staff.status,
            designation=db_staff.designation,
            skills=[sk.strip() for sk in db_staff.skills.split(",") if sk.strip()],
            location=db_staff.location,
            availability=db_staff.availability,
            project=db_staff.project,
            company=db_staff.company,
            reports_to=db_staff.reports_to,
            experience=db_staff.experience,
            joinDate=db_staff.joinDate,
            created_at=db_staff.created_at,
            updated_at=db_staff.updated_at
        )
        
        return created_response(
            data=staff_data,
            message="Staff member created successfully"
        )
    except ValidationError as e:
        db.rollback()
        return validation_error_response(
            message=e.message,
            error_code="VALIDATION_ERROR"
        )
    except Exception as e:
        db.rollback()
        return internal_error_response(
            message="Failed to create staff member",
            error_code="STAFF_CREATION_ERROR"
        )

@router.put("/{staff_id}", response_model=dict)
@require_manager_or_admin
@rate_limit_update("30/minute")
def update_staff(
    request: Request,
    staff_id: int,
    staff: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_hybrid)
):
    """Update a staff member"""
    try:
        if staff_id <= 0:
            raise ValidationError("Invalid staff ID")
        
        db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
        if db_staff is None:
            raise NotFoundError("Staff member", staff_id)
        
        update_data = staff.dict(exclude_unset=True)
        
        # Validate non-empty strings for required fields
        for field, value in update_data.items():
            if isinstance(value, str) and not value.strip():
                raise ValidationError(f"{field} cannot be empty")
        
        for field, value in update_data.items():
            if field == "skills" and value is not None:
                setattr(db_staff, field, ",".join(value))
            elif value is not None:
                setattr(db_staff, field, value)
        
        db.commit()
        db.refresh(db_staff)
        
        staff_data = StaffSchema(
            id=db_staff.id,
            name=db_staff.name,
            email=db_staff.email,
            phone=db_staff.phone,
            department=db_staff.department,
            status=db_staff.status,
            designation=db_staff.designation,
            skills=[sk.strip() for sk in db_staff.skills.split(",") if sk.strip()],
            location=db_staff.location,
            availability=db_staff.availability,
            project=db_staff.project,
            company=db_staff.company,
            reports_to=db_staff.reports_to,
            experience=db_staff.experience,
            joinDate=db_staff.joinDate,
            created_at=db_staff.created_at,
            updated_at=db_staff.updated_at
        )
        
        return updated_response(
            data=staff_data,
            message="Staff member updated successfully"
        )
    except ValidationError as e:
        return validation_error_response(
            message=e.message,
            error_code="VALIDATION_ERROR"
        )
    except NotFoundError as e:
        return not_found_response(
            resource="Staff member",
            resource_id=staff_id,
            error_code="NOT_FOUND_ERROR"
        )
    except Exception as e:
        db.rollback()
        return internal_error_response(
            message="Failed to update staff member",
            error_code="STAFF_UPDATE_ERROR"
        )

@router.delete("/{staff_id}", response_model=dict)
@require_admin
@rate_limit_delete("10/minute")
def delete_staff(
    request: Request,
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_hybrid)
):
    """Delete a staff member"""
    try:
        if staff_id <= 0:
            raise ValidationError("Invalid staff ID")
        
        db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
        if db_staff is None:
            raise NotFoundError("Staff member", staff_id)
        
        db.delete(db_staff)
        db.commit()
        return deleted_response(
            message="Staff member deleted successfully"
        )
    except ValidationError as e:
        return validation_error_response(
            message=e.message,
            error_code="VALIDATION_ERROR"
        )
    except NotFoundError as e:
        return not_found_response(
            resource="Staff member",
            resource_id=staff_id,
            error_code="NOT_FOUND_ERROR"
        )
    except Exception as e:
        db.rollback()
        return internal_error_response(
            message="Failed to delete staff member",
            error_code="STAFF_DELETION_ERROR"
        ) 