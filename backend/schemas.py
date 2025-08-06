from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = "pending"
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['pending', 'user', 'manager', 'admin']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {allowed_roles}')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Add new schemas for admin operations
class UserApproval(BaseModel):
    role: str
    is_active: bool = True

class UserList(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Bill schemas
class BillBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    currency: str = "USD"
    bill_date: datetime
    due_date: Optional[datetime] = None
    vendor: str
    category: str
    notes: Optional[str] = None

class BillCreate(BillBase):
    pass

class BillUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    bill_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    vendor: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Bill(BillBase):
    id: int
    status: str
    file_path: str
    file_name: str
    file_size: int
    file_type: str
    uploaded_by: int
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BillApproval(BaseModel):
    status: str  # approved, rejected
    notes: Optional[str] = None

# Component schemas
class ComponentBase(BaseModel):
    name: str
    category: str
    status: str
    location: str
    project: str
    owner: str
    description: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None

class ComponentCreate(ComponentBase):
    pass

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    project: Optional[str] = None
    owner: Optional[str] = None
    description: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None

class Component(ComponentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Location schemas
class LocationBase(BaseModel):
    name: str
    address: str
    team: int
    manager: str
    project: str
    status: str = "active"
    type: str = "branch"
    pointOfContact: str = ""
    assetCount: int = 0
    avatar: str | None = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    team: int | None = None
    manager: str | None = None
    project: str | None = None
    status: str | None = None
    type: str | None = None
    pointOfContact: str | None = None
    assetCount: int | None = None
    avatar: str | None = None

class Location(LocationBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    thumbnail_url: str | None = None
    name: str
    status: str
    progress: int
    category: str | None = None
    funding_type: str | None = None
    funding_body: str | None = None
    funding_received: int | None = None
    report_links: str | None = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    thumbnail_url: str | None = None
    name: str | None = None
    status: str | None = None
    progress: int | None = None
    category: str | None = None
    funding_type: str | None = None
    funding_body: str | None = None
    funding_received: int | None = None
    report_links: str | None = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    class Config:
        from_attributes = True

# Staff schemas
class StaffBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department: str
    status: str = "active"
    designation: str
    skills: List[str]
    location: str
    availability: str
    project: str
    company: str
    reports_to: Optional[str] = None
    experience: Optional[str] = None
    joinDate: Optional[str] = None

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    designation: str | None = None
    skills: List[str] | None = None
    location: str | None = None
    availability: str | None = None
    project: str | None = None
    company: str | None = None
    reports_to: str | None = None
    experience: str | None = None
    joinDate: str | None = None

class Staff(StaffBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    
    class Config:
        from_attributes = True 

# Training schemas
class TrainingBase(BaseModel):
    name: str
    institution: str
    duration: str
    level: str
    description: Optional[str] = None
    full_description: Optional[str] = None
    prerequisites: Optional[str] = None
    learning_objectives: Optional[str] = None
    course_outline: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_credentials: Optional[str] = None
    instructor_experience: Optional[str] = None
    instructor_image: Optional[str] = None
    schedule_start_date: Optional[datetime] = None
    schedule_end_date: Optional[datetime] = None
    schedule_format: Optional[str] = None
    schedule_location: Optional[str] = None
    pricing_amount: Optional[float] = None
    pricing_currency: Optional[str] = "USD"
    pricing_includes: Optional[str] = None
    enrolled_count: Optional[int] = 0
    completed_count: Optional[int] = 0
    max_capacity: Optional[int] = None
    status: Optional[str] = "active"
    category: Optional[str] = None
    tags: Optional[str] = None

class TrainingCreate(TrainingBase):
    pass

class TrainingUpdate(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    prerequisites: Optional[str] = None
    learning_objectives: Optional[str] = None
    course_outline: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_credentials: Optional[str] = None
    instructor_experience: Optional[str] = None
    instructor_image: Optional[str] = None
    schedule_start_date: Optional[datetime] = None
    schedule_end_date: Optional[datetime] = None
    schedule_format: Optional[str] = None
    schedule_location: Optional[str] = None
    pricing_amount: Optional[float] = None
    pricing_currency: Optional[str] = None
    pricing_includes: Optional[str] = None
    enrolled_count: Optional[int] = None
    completed_count: Optional[int] = None
    max_capacity: Optional[int] = None
    status: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None

class Training(TrainingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True 