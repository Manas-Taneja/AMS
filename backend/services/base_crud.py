"""
Base CRUD service for common database operations.
Reduces code duplication across endpoints.
"""

from typing import Type, TypeVar, Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from models import Base
from error_handlers import NotFoundError, ConflictError

ModelType = TypeVar("ModelType", bound=Base)

class BaseCRUDService:
    """Base CRUD service with common database operations"""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def get_by_id(self, db: Session, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_by_id_or_404(self, db: Session, id: int) -> ModelType:
        """Get a single record by ID or raise 404"""
        obj = self.get_by_id(db, id)
        if not obj:
            raise NotFoundError(self.model.__name__, id)
        return obj
    
    def get_all(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        search_fields: Optional[List[str]] = None,
        search_term: Optional[str] = None
    ) -> List[ModelType]:
        """Get all records with optional filtering and search"""
        query = db.query(self.model)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
        
        # Apply search
        if search_term and search_fields:
            # Sanitize search term to prevent SQL injection
            sanitized_search_term = search_term.strip()
            if sanitized_search_term:
                search_conditions = []
                for field in search_fields:
                    if hasattr(self.model, field):
                        search_conditions.append(
                            getattr(self.model, field).ilike(f"%{sanitized_search_term}%")
                        )
                if search_conditions:
                    query = query.filter(or_(*search_conditions))
        
        return query.offset(skip).limit(limit).all()
    
    def count(
        self, 
        db: Session,
        filters: Optional[Dict[str, Any]] = None,
        search_fields: Optional[List[str]] = None,
        search_term: Optional[str] = None
    ) -> int:
        """Count records with optional filtering and search"""
        query = db.query(self.model)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
        
        # Apply search
        if search_term and search_fields:
            # Sanitize search term to prevent SQL injection
            sanitized_search_term = search_term.strip()
            if sanitized_search_term:
                search_conditions = []
                for field in search_fields:
                    if hasattr(self.model, field):
                        search_conditions.append(
                            getattr(self.model, field).ilike(f"%{sanitized_search_term}%")
                        )
                if search_conditions:
                    query = query.filter(or_(*search_conditions))
        
        return query.count()
    
    def create(self, db: Session, **kwargs) -> ModelType:
        """Create a new record"""
        try:
            db_obj = self.model(**kwargs)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            raise ConflictError(f"Failed to create {self.model.__name__}: {str(e)}")
    
    def update(
        self, 
        db: Session, 
        id: int, 
        update_data: Dict[str, Any],
        exclude_unset: bool = True
    ) -> ModelType:
        """Update a record by ID"""
        obj = self.get_by_id_or_404(db, id)
        
        try:
            if exclude_unset:
                update_data = {k: v for k, v in update_data.items() if v is not None}
            
            for field, value in update_data.items():
                if hasattr(obj, field):
                    setattr(obj, field, value)
            
            db.commit()
            db.refresh(obj)
            return obj
        except Exception as e:
            db.rollback()
            raise ConflictError(f"Failed to update {self.model.__name__}: {str(e)}")
    
    def delete(self, db: Session, id: int) -> bool:
        """Delete a record by ID"""
        obj = self.get_by_id_or_404(db, id)
        
        try:
            db.delete(obj)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise ConflictError(f"Failed to delete {self.model.__name__}: {str(e)}")
    
    def exists(self, db: Session, id: int) -> bool:
        """Check if a record exists by ID"""
        return db.query(self.model).filter(self.model.id == id).first() is not None
    
    def get_distinct_values(self, db: Session, field: str) -> List[Any]:
        """Get distinct values for a field"""
        if not hasattr(self.model, field):
            raise ValueError(f"Field {field} does not exist in {self.model.__name__}")
        
        return [row[0] for row in db.query(getattr(self.model, field)).distinct().all()]
    
    def bulk_create(self, db: Session, objects: List[Dict[str, Any]]) -> List[ModelType]:
        """Create multiple records"""
        try:
            db_objects = [self.model(**obj) for obj in objects]
            db.add_all(db_objects)
            db.commit()
            for obj in db_objects:
                db.refresh(obj)
            return db_objects
        except Exception as e:
            db.rollback()
            raise ConflictError(f"Failed to bulk create {self.model.__name__}: {str(e)}")
    
    def bulk_update(self, db: Session, updates: List[Dict[str, Any]]) -> List[ModelType]:
        """Update multiple records"""
        try:
            updated_objects = []
            for update in updates:
                if 'id' not in update:
                    raise ValueError("Each update must contain an 'id' field")
                
                obj = self.get_by_id_or_404(db, update['id'])
                update_data = {k: v for k, v in update.items() if k != 'id' and v is not None}
                
                for field, value in update_data.items():
                    if hasattr(obj, field):
                        setattr(obj, field, value)
                
                updated_objects.append(obj)
            
            db.commit()
            for obj in updated_objects:
                db.refresh(obj)
            return updated_objects
        except Exception as e:
            db.rollback()
            raise ConflictError(f"Failed to bulk update {self.model.__name__}: {str(e)}") 