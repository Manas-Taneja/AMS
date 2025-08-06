"""
Training router for AMS Backend.
Handles training CRUD operations with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import json

from database import get_db
from models import Training, User
from schemas import TrainingCreate, TrainingUpdate, Training as TrainingSchema
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin, require_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError, create_error_response

router = APIRouter(prefix="/api/training", tags=["Training"])

@router.get("/", response_model=list[TrainingSchema])
@require_staff_or_above
@rate_limit_search("30/minute")
def get_training_courses(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    level: Optional[str] = Query(None, max_length=50, description="Filter by level"),
    category: Optional[str] = Query(None, max_length=100, description="Filter by category"),
    status: Optional[str] = Query(None, max_length=50, description="Filter by status"),
    institution: Optional[str] = Query(None, max_length=255, description="Filter by institution"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get training courses with optional filtering and search"""
    try:
        query = db.query(Training)
        
        # Apply search filter
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
        
        # Apply filters
        if level:
            query = query.filter(Training.level == level.strip())
        
        if category:
            query = query.filter(Training.category == category.strip())
        
        if status:
            query = query.filter(Training.status == status.strip())
        
        if institution:
            query = query.filter(Training.institution.ilike(f"%{institution.strip()}%"))
        
        training_courses = query.order_by(Training.created_at.desc()).offset(skip).limit(limit).all()
        return training_courses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training courses",
                error_code="TRAINING_RETRIEVAL_ERROR"
            )
        )

@router.get("/{training_id}", response_model=TrainingSchema)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_course(
    request: Request, 
    training_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific training course by ID"""
    try:
        if training_id <= 0:
            raise ValidationError("Invalid training ID")
        
        training = db.query(Training).filter(Training.id == training_id).first()
        if training is None:
            raise NotFoundError("Training", training_id)
        
        return training
        
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
                message="Failed to retrieve training course",
                error_code="TRAINING_RETRIEVAL_ERROR"
            )
        )

@router.post("/", response_model=TrainingSchema)
@require_manager_or_admin
@rate_limit_create("10/minute")
def create_training_course(
    request: Request,
    training_data: TrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new training course"""
    try:
        # Validate JSON fields
        if training_data.prerequisites:
            try:
                json.loads(training_data.prerequisites)
            except json.JSONDecodeError:
                raise ValidationError("Invalid prerequisites JSON format")
        
        if training_data.learning_objectives:
            try:
                json.loads(training_data.learning_objectives)
            except json.JSONDecodeError:
                raise ValidationError("Invalid learning objectives JSON format")
        
        if training_data.course_outline:
            try:
                json.loads(training_data.course_outline)
            except json.JSONDecodeError:
                raise ValidationError("Invalid course outline JSON format")
        
        if training_data.pricing_includes:
            try:
                json.loads(training_data.pricing_includes)
            except json.JSONDecodeError:
                raise ValidationError("Invalid pricing includes JSON format")
        
        if training_data.tags:
            try:
                json.loads(training_data.tags)
            except json.JSONDecodeError:
                raise ValidationError("Invalid tags JSON format")
        
        # Create training course
        db_training = Training(
            **training_data.dict(),
            created_by=current_user.id,
            updated_by=current_user.id
        )
        
        db.add(db_training)
        db.commit()
        db.refresh(db_training)
        
        return db_training
        
    except ValidationError as e:
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
                message="Failed to create training course",
                error_code="TRAINING_CREATION_ERROR"
            )
        )

@router.put("/{training_id}", response_model=TrainingSchema)
@require_manager_or_admin
@rate_limit_update("20/minute")
def update_training_course(
    request: Request,
    training_id: int,
    training_data: TrainingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a training course"""
    try:
        if training_id <= 0:
            raise ValidationError("Invalid training ID")
        
        training = db.query(Training).filter(Training.id == training_id).first()
        if training is None:
            raise NotFoundError("Training", training_id)
        
        # Validate JSON fields if provided
        update_data = training_data.dict(exclude_unset=True)
        
        for field in ['prerequisites', 'learning_objectives', 'course_outline', 'pricing_includes', 'tags']:
            if field in update_data and update_data[field]:
                try:
                    json.loads(update_data[field])
                except json.JSONDecodeError:
                    raise ValidationError(f"Invalid {field} JSON format")
        
        # Update fields
        for field, value in update_data.items():
            setattr(training, field, value)
        
        training.updated_by = current_user.id
        
        db.commit()
        db.refresh(training)
        
        return training
        
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
                message="Failed to update training course",
                error_code="TRAINING_UPDATE_ERROR"
            )
        )

@router.delete("/{training_id}")
@require_admin
@rate_limit_delete("10/minute")
def delete_training_course(
    request: Request,
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a training course"""
    try:
        if training_id <= 0:
            raise ValidationError("Invalid training ID")
        
        training = db.query(Training).filter(Training.id == training_id).first()
        if training is None:
            raise NotFoundError("Training", training_id)
        
        db.delete(training)
        db.commit()
        
        return {"message": "Training course deleted successfully"}
        
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
                message="Failed to delete training course",
                error_code="TRAINING_DELETION_ERROR"
            )
        )

# Training metadata endpoints
@router.get("/levels")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_levels(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all training levels"""
    try:
        levels = db.query(Training.level).distinct().all()
        return [level[0] for level in levels if level[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training levels",
                error_code="TRAINING_LEVELS_ERROR"
            )
        )

@router.get("/categories")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_categories(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all training categories"""
    try:
        categories = db.query(Training.category).distinct().all()
        return [category[0] for category in categories if category[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training categories",
                error_code="TRAINING_CATEGORIES_ERROR"
            )
        )

@router.get("/institutions")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_institutions(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all training institutions"""
    try:
        institutions = db.query(Training.institution).distinct().all()
        return [institution[0] for institution in institutions if institution[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training institutions",
                error_code="TRAINING_INSTITUTIONS_ERROR"
            )
        )

@router.get("/statuses")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_statuses(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all training statuses"""
    try:
        statuses = db.query(Training.status).distinct().all()
        return [status[0] for status in statuses if status[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training statuses",
                error_code="TRAINING_STATUSES_ERROR"
            )
        )

@router.get("/stats")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_training_stats(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get training statistics"""
    try:
        total_courses = db.query(Training).count()
        active_courses = db.query(Training).filter(Training.status == "active").count()
        completed_courses = db.query(Training).filter(Training.status == "completed").count()
        total_enrolled = db.query(Training.enrolled_count).all()
        total_completed = db.query(Training.completed_count).all()
        
        total_enrolled_sum = sum([enrolled[0] for enrolled in total_enrolled if enrolled[0]])
        total_completed_sum = sum([completed[0] for completed in total_completed if completed[0]])
        
        return {
            "total_courses": total_courses,
            "active_courses": active_courses,
            "completed_courses": completed_courses,
            "total_enrolled": total_enrolled_sum,
            "total_completed": total_completed_sum
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve training statistics",
                error_code="TRAINING_STATS_ERROR"
            )
        ) 