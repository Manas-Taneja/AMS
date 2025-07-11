from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from passlib.context import CryptContext

Base = declarative_base()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, nullable=False, default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    bill_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    vendor = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Utilities, Equipment, Services, etc.
    status = Column(String, default="pending")  # pending, approved, rejected, paid
    file_path = Column(String, nullable=False)  # Path to uploaded file
    file_name = Column(String, nullable=False)  # Original filename
    file_size = Column(Integer, nullable=False)  # File size in bytes
    file_type = Column(String, nullable=False)  # MIME type
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Component(Base):
    __tablename__ = "components"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)  # Active, Idle, Maintenance
    location = Column(String, nullable=False)
    project = Column(String, nullable=False)
    owner = Column(String, nullable=False)  # PSSL, Prakhar Aviation, IIDT
    description = Column(String, nullable=True)
    serial_number = Column(String, nullable=True)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    warranty_expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    team = Column(Integer, nullable=False)
    manager = Column(String, nullable=False)
    project = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    thumbnail_url = Column(String, nullable=True)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # Active, Paused, Completed
    progress = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    skills = Column(String, nullable=False)  # Comma-separated
    location = Column(String, nullable=False)
    availability = Column(String, nullable=False)
    project = Column(String, nullable=False)
    company = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 