from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
from datetime import datetime

Base = declarative_base()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, nullable=False, default='pending', index=True)  # Add index for filtering
    is_oauth_user = Column(Boolean, default=False)  # Flag for OAuth users
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    def can_use_password_auth(self) -> bool:
        """Check if user can use password authentication"""
        return not self.is_oauth_user and self.hashed_password is not None

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    bill_date = Column(DateTime(timezone=True), nullable=False, index=True)  # Add index for date queries
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Add index for date queries
    vendor = Column(String, nullable=False, index=True)  # Add index for filtering
    category = Column(String, nullable=False, index=True)  # Utilities, Equipment, Services, etc. - Add index for filtering
    status = Column(String, default="pending", index=True)  # pending, approved, rejected, paid - Add index for filtering
    file_path = Column(String, nullable=False)  # Path to uploaded file
    file_name = Column(String, nullable=False)  # Original filename
    file_size = Column(Integer, nullable=False)  # File size in bytes
    file_type = Column(String, nullable=False)  # MIME type
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Add index for foreign key
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Add index for foreign key
    approved_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Add index for sorting
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Add index for sorting

class Component(Base):
    __tablename__ = "components"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # Add index for search
    category = Column(String, nullable=False, index=True)  # Add index for filtering
    status = Column(String, nullable=False, index=True)  # Add index for filtering
    location = Column(String, nullable=False, index=True)  # Add index for filtering
    project = Column(String, nullable=False, index=True)  # Add index for filtering
    owner = Column(String, nullable=False, index=True)  # Add index for filtering
    description = Column(String, nullable=True)
    serial_number = Column(String, nullable=True, index=True)  # Add index for search
    purchase_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Add index for date queries
    warranty_expiry = Column(DateTime(timezone=True), nullable=True, index=True)  # Add index for date queries
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Add index for sorting
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Add index for sorting

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # Add index for search
    address = Column(String, nullable=False)
    team = Column(Integer, nullable=False, index=True)  # Add index for filtering
    manager = Column(String, nullable=False, index=True)  # Add index for filtering
    project = Column(String, nullable=False, index=True)  # Add index for filtering
    status = Column(String, nullable=False, default="active", index=True)  # Add index for filtering
    type = Column(String, nullable=False, default="branch", index=True)  # Add index for filtering
    pointOfContact = Column(String, nullable=False, default="")  # Point of contact person
    assetCount = Column(Integer, nullable=False, default=0)  # Number of assets at this location
    avatar = Column(String, nullable=True)  # Avatar/initials for display
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Add index for sorting
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Add index for sorting

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    thumbnail_url = Column(String, nullable=True)
    name = Column(String, nullable=False, index=True)  # Add index for search
    status = Column(String, nullable=False, index=True)  # Add index for filtering
    progress = Column(Integer, nullable=False, index=True)  # Add index for filtering
    category = Column(String, nullable=True, index=True)  # Add index for filtering
    funding_type = Column(String, nullable=True)  # govt, self
    funding_body = Column(String, nullable=True)  # Government body name
    funding_received = Column(Integer, nullable=True)  # Amount in rupees
    report_links = Column(Text, nullable=True)  # JSON string of report links
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Add index for sorting
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Add index for sorting

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)  # Add index for search
    phone = Column(String, nullable=True)  # Phone number
    department = Column(String, nullable=False, index=True)  # Add index for filtering
    status = Column(String, nullable=False, default="active", index=True)  # Add index for filtering
    designation = Column(String, nullable=False, index=True)  # Add index for filtering
    skills = Column(String, nullable=False)  # Comma-separated
    location = Column(String, nullable=False, index=True)  # Add index for filtering
    availability = Column(String, nullable=False, index=True)  # Add index for filtering
    project = Column(String, nullable=False, index=True)  # Add index for filtering
    company = Column(String, nullable=False, index=True)  # Add index for filtering
    experience = Column(String, nullable=True)  # Experience description
    joinDate = Column(String, nullable=True)  # Join date as string
    reports_to = Column(String, nullable=True)  # Who the staff member reports to
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Add index for sorting
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Add index for sorting 

class Training(Base):
    __tablename__ = "training"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    institution = Column(String(255), nullable=False, index=True)  # Add index for filtering
    duration = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False, index=True)  # beginner, intermediate, advanced - Add index for filtering
    description = Column(Text)
    full_description = Column(Text)
    prerequisites = Column(Text)  # JSON string of prerequisites
    learning_objectives = Column(Text)  # JSON string of objectives
    course_outline = Column(Text)  # JSON string of course modules
    instructor_name = Column(String(255))
    instructor_credentials = Column(String(255))
    instructor_experience = Column(Text)
    instructor_image = Column(String(500))
    schedule_start_date = Column(DateTime, index=True)  # Add index for date queries
    schedule_end_date = Column(DateTime, index=True)  # Add index for date queries
    schedule_format = Column(String(100))  # online, in-person, hybrid
    schedule_location = Column(String(255))
    pricing_amount = Column(Numeric(10, 2))
    pricing_currency = Column(String(10), default="USD")
    pricing_includes = Column(Text)  # JSON string of what's included
    enrolled_count = Column(Integer, default=0)
    completed_count = Column(Integer, default=0)
    max_capacity = Column(Integer)
    status = Column(String(50), default="active", index=True)  # active, inactive, completed - Add index for filtering
    category = Column(String(100), index=True)  # Add index for filtering
    tags = Column(Text)  # JSON string of tags
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # Add index for sorting
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)  # Add index for sorting
    created_by = Column(Integer, ForeignKey("users.id"), index=True)  # Add index for foreign key
    updated_by = Column(Integer, ForeignKey("users.id"), index=True)  # Add index for foreign key

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by]) 