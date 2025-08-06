"""
Bills router for AMS Backend.
Handles bill CRUD operations and file uploads with proper error handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from database import get_db
from models import Bill, User
from schemas import BillCreate, BillUpdate, Bill as BillSchema, BillApproval
from auth import get_current_active_user
from middleware import require_staff_or_above, require_manager_or_admin
from rate_limiting import rate_limit_search, rate_limit_api, rate_limit_create, rate_limit_update, rate_limit_delete
from error_handlers import NotFoundError, ValidationError, AuthorizationError, create_error_response
from file_upload import file_upload_manager

router = APIRouter(prefix="/api/bills", tags=["Bills"])

@router.get("/stats")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_bill_stats(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get bill statistics"""
    try:
        total_bills = db.query(Bill).count()
        pending_bills = db.query(Bill).filter(Bill.status == "pending").count()
        approved_bills = db.query(Bill).filter(Bill.status == "approved").count()
        total_amount = db.query(Bill.amount).filter(Bill.status == "approved").all()
        total_amount = sum([amount[0] for amount in total_amount]) if total_amount else 0
        
        return {
            "total_bills": total_bills,
            "pending_bills": pending_bills,
            "approved_bills": approved_bills,
            "total_amount": total_amount
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve bill statistics",
                error_code="BILL_STATS_ERROR"
            )
        )

@router.get("/categories")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_bill_categories(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all bill categories"""
    try:
        categories = db.query(Bill.category).distinct().all()
        return [category[0] for category in categories if category[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve bill categories",
                error_code="BILL_CATEGORIES_ERROR"
            )
        )

@router.get("/vendors")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_bill_vendors(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all bill vendors"""
    try:
        vendors = db.query(Bill.vendor).distinct().all()
        return [vendor[0] for vendor in vendors if vendor[0]]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve bill vendors",
                error_code="BILL_VENDORS_ERROR"
            )
        )

@router.get("/statuses")
@require_staff_or_above
@rate_limit_api("100/minute")
def get_bill_statuses(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get all bill statuses"""
    return ["pending", "approved", "rejected", "paid"]

@router.get("/", response_model=list[BillSchema])
@require_staff_or_above
@rate_limit_search("30/minute")
def get_bills(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    status: Optional[str] = Query(None, max_length=20, description="Filter by status"),
    category: Optional[str] = Query(None, max_length=50, description="Filter by category"),
    vendor: Optional[str] = Query(None, max_length=100, description="Filter by vendor"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all bills with optional filtering"""
    try:
        query = db.query(Bill)
        
        # Apply search filter
        if search:
            search_term = search.strip()
            if search_term:
                search_conditions = [
                    Bill.title.ilike(f"%{search_term}%"),
                    Bill.vendor.ilike(f"%{search_term}%"),
                    Bill.description.ilike(f"%{search_term}%")
                ]
                query = query.filter(or_(*search_conditions))
        
        # Apply filters
        if status:
            query = query.filter(Bill.status == status.strip())
        
        if category:
            query = query.filter(Bill.category == category.strip())
        
        if vendor:
            vendor_term = vendor.strip()
            if vendor_term:
                query = query.filter(Bill.vendor.ilike(f"%{vendor_term}%"))
        
        # If user is not admin, only show their own bills or approved bills
        if current_user.role not in ['admin', 'manager']:
            query = query.filter(
                (Bill.uploaded_by == current_user.id) | 
                (Bill.status == 'approved')
            )
        
        bills = query.order_by(Bill.created_at.desc()).offset(skip).limit(limit).all()
        return bills
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_error_response(
                status_code=500,
                message="Failed to retrieve bills",
                error_code="BILLS_RETRIEVAL_ERROR"
            )
        )

@router.get("/{bill_id}", response_model=BillSchema)
@require_staff_or_above
@rate_limit_api("100/minute")
def get_bill(
    request: Request,
    bill_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific bill"""
    try:
        if bill_id <= 0:
            raise ValidationError("Invalid bill ID")
        
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise NotFoundError("Bill", bill_id)
        
        # Check if user has permission to view this bill
        if current_user.role not in ['admin', 'manager'] and bill.uploaded_by != current_user.id:
            raise AuthorizationError("Not authorized to view this bill")
        
        return bill
        
    except (ValidationError, NotFoundError, AuthorizationError) as e:
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
                message="Failed to retrieve bill",
                error_code="BILL_RETRIEVAL_ERROR"
            )
        )

@router.post("/", response_model=BillSchema)
@require_staff_or_above
@rate_limit_create("20/minute")
async def create_bill(
    request: Request,
    bill: BillCreate,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new bill with file upload"""
    try:
        # Validate required fields
        if not bill.title or not bill.title.strip():
            raise ValidationError("Bill title is required")
        
        if not bill.vendor or not bill.vendor.strip():
            raise ValidationError("Bill vendor is required")
        
        if not bill.category or not bill.category.strip():
            raise ValidationError("Bill category is required")
        
        if bill.amount <= 0:
            raise ValidationError("Bill amount must be greater than 0")
        
        # Save uploaded file
        file_info = await file_upload_manager.save_uploaded_file(file, current_user.id)
        
        # Create bill record
        db_bill = Bill(
            **bill.dict(),
            uploaded_by=current_user.id,
            file_path=file_info["file_path"],
            file_name=file_info["file_name"],
            file_size=file_info["file_size"],
            file_type=file_info["file_type"]
        )
        
        db.add(db_bill)
        db.commit()
        db.refresh(db_bill)
        return db_bill
        
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
                message="Failed to create bill",
                error_code="BILL_CREATION_ERROR"
            )
        )

@router.put("/{bill_id}", response_model=BillSchema)
@require_staff_or_above
@rate_limit_update("30/minute")
def update_bill(
    request: Request,
    bill_id: int,
    bill_update: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a bill"""
    try:
        if bill_id <= 0:
            raise ValidationError("Invalid bill ID")
        
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise NotFoundError("Bill", bill_id)
        
        # Check if user has permission to update this bill
        if current_user.role not in ['admin', 'manager'] and bill.uploaded_by != current_user.id:
            raise AuthorizationError("Not authorized to update this bill")
        
        # Only allow updates if bill is not approved
        if bill.status == 'approved':
            raise ValidationError("Cannot update approved bill")
        
        update_data = bill_update.dict(exclude_unset=True)
        
        # Validate non-empty strings for required fields
        for field, value in update_data.items():
            if isinstance(value, str) and not value.strip():
                raise ValidationError(f"{field} cannot be empty")
        
        for field, value in update_data.items():
            setattr(bill, field, value)
        
        db.commit()
        db.refresh(bill)
        return bill
        
    except (ValidationError, NotFoundError, AuthorizationError) as e:
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
                message="Failed to update bill",
                error_code="BILL_UPDATE_ERROR"
            )
        )

@router.delete("/{bill_id}")
@require_manager_or_admin
@rate_limit_delete("10/minute")
def delete_bill(
    request: Request,
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a bill (managers and admins only)"""
    try:
        if bill_id <= 0:
            raise ValidationError("Invalid bill ID")
        
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise NotFoundError("Bill", bill_id)
        
        db.delete(bill)
        db.commit()
        return {"message": "Bill deleted successfully"}
        
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
                message="Failed to delete bill",
                error_code="BILL_DELETION_ERROR"
            )
        )

@router.put("/{bill_id}/approve")
@require_manager_or_admin
@rate_limit_update("30/minute")
def approve_bill(
    request: Request,
    bill_id: int,
    approval_data: BillApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve or reject a bill (managers and admins only)"""
    try:
        if bill_id <= 0:
            raise ValidationError("Invalid bill ID")
        
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise NotFoundError("Bill", bill_id)
        
        # Validate status
        valid_statuses = ["approved", "rejected"]
        if approval_data.status not in valid_statuses:
            raise ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        
        bill.status = approval_data.status
        bill.approved_by = current_user.id
        bill.approved_at = datetime.utcnow()
        if approval_data.notes:
            bill.notes = approval_data.notes
        
        db.commit()
        db.refresh(bill)
        
        return {
            "message": f"Bill {approval_data.status} successfully",
            "bill": BillSchema.from_orm(bill)
        }
        
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
                message="Failed to approve bill",
                error_code="BILL_APPROVAL_ERROR"
            )
        ) 