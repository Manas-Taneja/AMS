from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import requests
import os
from dotenv import load_dotenv
from middleware import require_admin, require_manager_or_admin, require_staff_or_above

# Load environment variables from .env file
load_dotenv()

from database import engine, get_db
from models import Base, User, Component, Location, Project, Staff, Bill
from schemas import (
    UserCreate, User as UserSchema, LoginRequest, LoginResponse,
    ComponentCreate, ComponentUpdate, Component as ComponentSchema,
    LocationCreate, LocationUpdate, Location as LocationSchema,
    ProjectCreate, ProjectUpdate, Project as ProjectSchema,
    StaffCreate, StaffUpdate, Staff as StaffSchema,
    BillCreate, BillUpdate, Bill as BillSchema, BillApproval,
    UserList, UserApproval
)
from auth import (
    authenticate_user, 
    create_access_token, 
    get_current_active_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret")
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"
FRONTEND_URL = "http://localhost:5173"

# Debug: Print the client ID being used (remove this in production)
print(f"Using Google Client ID: {GOOGLE_CLIENT_ID}")
print(f"Using Google Client Secret: {GOOGLE_CLIENT_SECRET[:10]}..." if GOOGLE_CLIENT_SECRET != "your-google-client-secret" else "Using placeholder client secret")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AMS Backend", version="1.0.0")

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AMS Backend is running!"}

@app.get("/api/hello")
def hello():
    return {"greeting": "Hello from FastAPI backend!"}

# Authentication endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is pending approval
    if user.role == 'pending':
        # Still allow login but return a special response indicating pending status
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserSchema.from_orm(user)
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.from_orm(user)
    )

@app.get("/api/auth/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return UserSchema.from_orm(current_user)

@app.post("/api/auth/logout")
def logout():
    # In a real application, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}

# User management endpoints
@app.post("/api/auth/register", response_model=UserSchema)
@require_admin
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserSchema.from_orm(db_user)

# Component endpoints
@app.get("/api/components", response_model=list[ComponentSchema])
@require_staff_or_above
def get_components(
    skip: int = 0, 
    limit: int = 100, 
    search: str = None,
    category: str = None,
    status: str = None,
    owner: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Component)
    
    if search:
        query = query.filter(
            Component.name.ilike(f"%{search}%") |
            Component.category.ilike(f"%{search}%") |
            Component.project.ilike(f"%{search}%") |
            Component.location.ilike(f"%{search}%")
        )
    
    if category:
        query = query.filter(Component.category == category)
    
    if status:
        query = query.filter(Component.status == status)
    
    if owner:
        query = query.filter(Component.owner == owner)
    
    components = query.offset(skip).limit(limit).all()
    return components

@app.get("/api/components/{component_id}", response_model=ComponentSchema)
@require_staff_or_above
def get_component(component_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    component = db.query(Component).filter(Component.id == component_id).first()
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@app.post("/api/components", response_model=ComponentSchema)
@require_manager_or_admin
def create_component(
    component: ComponentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_component = Component(**component.dict())
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

@app.put("/api/components/{component_id}", response_model=ComponentSchema)
@require_manager_or_admin
def update_component(
    component_id: int, 
    component: ComponentUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    update_data = component.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_component, field, value)
    
    db.commit()
    db.refresh(db_component)
    return db_component

@app.delete("/api/components/{component_id}")
@require_admin
def delete_component(
    component_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(db_component)
    db.commit()
    return {"message": "Component deleted successfully"}

# Component metadata endpoints
@app.get("/api/components/categories")
@require_staff_or_above
def get_component_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    categories = db.query(Component.category).distinct().all()
    return [category[0] for category in categories]

@app.get("/api/components/owners")
@require_staff_or_above
def get_component_owners(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    owners = db.query(Component.owner).distinct().all()
    return [owner[0] for owner in owners]

@app.get("/api/components/statuses")
@require_staff_or_above
def get_component_statuses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    statuses = db.query(Component.status).distinct().all()
    return [status[0] for status in statuses]

# Location endpoints
@app.get("/api/locations", response_model=list[LocationSchema])
@require_staff_or_above
def get_locations(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Location)
    if search:
        query = query.filter(
            Location.name.ilike(f"%{search}%") |
            Location.address.ilike(f"%{search}%") |
            Location.manager.ilike(f"%{search}%")
        )
    locations = query.offset(skip).limit(limit).all()
    return locations

@app.get("/api/locations/{location_id}", response_model=LocationSchema)
@require_staff_or_above
def get_location(location_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@app.post("/api/locations", response_model=LocationSchema)
@require_admin
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.put("/api/locations/{location_id}", response_model=LocationSchema)
@require_manager_or_admin
def update_location(
    location_id: int,
    location: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    update_data = location.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_location, field, value)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.delete("/api/locations/{location_id}")
@require_admin
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(db_location)
    db.commit()
    return {"message": "Location deleted successfully"}

# Project endpoints
@app.get("/api/projects", response_model=list[ProjectSchema])
@require_staff_or_above
def get_projects(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Project)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))
    projects = query.offset(skip).limit(limit).all()
    return projects

@app.get("/api/projects/{project_id}", response_model=ProjectSchema)
@require_staff_or_above
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.post("/api/projects", response_model=ProjectSchema)
@require_admin
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/api/projects/{project_id}", response_model=ProjectSchema)
@require_manager_or_admin
def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = project.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}")
@require_admin
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# Staff endpoints
@app.get("/api/staff", response_model=list[StaffSchema])
@require_staff_or_above
def get_staff(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    company: str = None,
    designation: str = None,
    skill: str = None,
    availability: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Staff)
    if search:
        query = query.filter(
            Staff.name.ilike(f"%{search}%") |
            Staff.designation.ilike(f"%{search}%") |
            Staff.skills.ilike(f"%{search}%")
        )
    if company:
        query = query.filter(Staff.company == company)
    if designation:
        query = query.filter(Staff.designation == designation)
    if skill:
        query = query.filter(Staff.skills.ilike(f"%{skill}%"))
    if availability:
        query = query.filter(Staff.availability == availability)
    staff = query.offset(skip).limit(limit).all()
    # Convert skills from comma-separated string to list
    return [StaffSchema(
        id=s.id,
        name=s.name,
        designation=s.designation,
        skills=[sk.strip() for sk in s.skills.split(",") if sk.strip()],
        location=s.location,
        availability=s.availability,
        project=s.project,
        company=s.company,
        created_at=s.created_at,
        updated_at=s.updated_at
    ) for s in staff]

@app.get("/api/staff/{staff_id}", response_model=StaffSchema)
@require_staff_or_above
def get_staff_member(staff_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    s = db.query(Staff).filter(Staff.id == staff_id).first()
    if s is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return StaffSchema(
        id=s.id,
        name=s.name,
        designation=s.designation,
        skills=[sk.strip() for sk in s.skills.split(",") if sk.strip()],
        location=s.location,
        availability=s.availability,
        project=s.project,
        company=s.company,
        created_at=s.created_at,
        updated_at=s.updated_at
    )

@app.post("/api/staff", response_model=StaffSchema)
@require_admin
def create_staff(
    staff: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_staff = Staff(
        name=staff.name,
        designation=staff.designation,
        skills=",".join(staff.skills),
        location=staff.location,
        availability=staff.availability,
        project=staff.project,
        company=staff.company
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return StaffSchema(
        id=db_staff.id,
        name=db_staff.name,
        designation=db_staff.designation,
        skills=[sk.strip() for sk in db_staff.skills.split(",") if sk.strip()],
        location=db_staff.location,
        availability=db_staff.availability,
        project=db_staff.project,
        company=db_staff.company,
        created_at=db_staff.created_at,
        updated_at=db_staff.updated_at
    )

@app.put("/api/staff/{staff_id}", response_model=StaffSchema)
@require_manager_or_admin
def update_staff(
    staff_id: int,
    staff: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    update_data = staff.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "skills" and value is not None:
            setattr(db_staff, field, ",".join(value))
        elif value is not None:
            setattr(db_staff, field, value)
    db.commit()
    db.refresh(db_staff)
    return StaffSchema(
        id=db_staff.id,
        name=db_staff.name,
        designation=db_staff.designation,
        skills=[sk.strip() for sk in db_staff.skills.split(",") if sk.strip()],
        location=db_staff.location,
        availability=db_staff.availability,
        project=db_staff.project,
        company=db_staff.company,
        created_at=db_staff.created_at,
        updated_at=db_staff.updated_at
    )

@app.delete("/api/staff/{staff_id}")
@require_admin
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    db.delete(db_staff)
    db.commit()
    return {"message": "Staff member deleted successfully"}

# Google OAuth endpoints
@app.get("/auth/google")
def google_auth():
    """Initiate Google OAuth flow"""
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    # Build the authorization URL
    auth_url = f"{google_auth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(url=auth_url)

@app.get("/auth/google/callback")
def google_auth_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_info = token_response.json()
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token_info['access_token']}"}
        user_response = requests.get(user_info_url, headers=headers)
        user_response.raise_for_status()
        user_info = user_response.json()
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info['email']).first()
        
        if not user:
            # Auto-create with 'pending' role
            user = User(
                email=user_info['email'],
                username=user_info['email'].split('@')[0],
                full_name=user_info['name'],
                hashed_password="",  # No password for OAuth users
                role='pending',  # Requires admin approval
                is_superuser=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create JWT token and return
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?token={access_token}&user={user.id}"
        )
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?error=oauth_failed"
        )

# Admin user management endpoints
@app.get("/api/admin/users", response_model=list[UserList])
@require_admin
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all users (admin only)"""
    users = db.query(User).all()
    return users

@app.get("/api/admin/users/pending", response_model=list[UserList])
@require_admin
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get users with pending role (admin only)"""
    pending_users = db.query(User).filter(User.role == 'pending').all()
    return pending_users

@app.put("/api/admin/users/{user_id}/approve")
@require_admin
def approve_user(
    user_id: int, 
    approval_data: UserApproval, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve user and assign role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user role and status
    user.role = approval_data.role
    user.is_active = approval_data.is_active
    
    # If assigning admin role, also set is_superuser
    if approval_data.role == 'admin':
        user.is_superuser = True
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {user.full_name} approved successfully",
        "user": UserSchema.from_orm(user)
    }

@app.put("/api/admin/users/{user_id}/role")
@require_admin
def update_user_role(
    user_id: int, 
    role: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from removing their own admin role
    if user.id == current_user.id and role != 'admin':
        raise HTTPException(
            status_code=400, 
            detail="Cannot remove your own admin role"
        )
    
    user.role = role
    user.is_superuser = (role == 'admin')
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {user.full_name} role updated to {role}",
        "user": UserSchema.from_orm(user)
    }

@app.put("/api/admin/users/{user_id}/status")
@require_admin
def update_user_status(
    user_id: int, 
    is_active: bool, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user active status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deactivating themselves
    if user.id == current_user.id and not is_active:
        raise HTTPException(
            status_code=400, 
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {user.full_name} {'activated' if is_active else 'deactivated'}",
        "user": UserSchema.from_orm(user)
    }

@app.delete("/api/admin/users/{user_id}")
@require_admin
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.full_name} deleted successfully"}

# Bill endpoints
@app.get("/api/bills/stats")
@require_staff_or_above
def get_bill_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get bill statistics"""
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

@app.get("/api/bills/categories")
@require_staff_or_above
def get_bill_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get all bill categories"""
    categories = db.query(Bill.category).distinct().all()
    return [category[0] for category in categories]

@app.get("/api/bills/vendors")
@require_staff_or_above
def get_bill_vendors(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get all bill vendors"""
    vendors = db.query(Bill.vendor).distinct().all()
    return [vendor[0] for vendor in vendors]

@app.get("/api/bills/statuses")
@require_staff_or_above
def get_bill_statuses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get all bill statuses"""
    return ["pending", "approved", "rejected", "paid"]

@app.get("/api/bills", response_model=list[BillSchema])
@require_staff_or_above
def get_bills(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status: str = None,
    category: str = None,
    vendor: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all bills with optional filtering"""
    query = db.query(Bill)
    
    if search:
        query = query.filter(
            Bill.title.ilike(f"%{search}%") |
            Bill.vendor.ilike(f"%{search}%") |
            Bill.description.ilike(f"%{search}%")
        )
    
    if status:
        query = query.filter(Bill.status == status)
    
    if category:
        query = query.filter(Bill.category == category)
    
    if vendor:
        query = query.filter(Bill.vendor.ilike(f"%{vendor}%"))
    
    # If user is not admin, only show their own bills or approved bills
    if current_user.role not in ['admin', 'manager']:
        query = query.filter(
            (Bill.uploaded_by == current_user.id) | 
            (Bill.status == 'approved')
        )
    
    bills = query.order_by(Bill.created_at.desc()).offset(skip).limit(limit).all()
    return bills

@app.get("/api/bills/{bill_id}", response_model=BillSchema)
@require_staff_or_above
def get_bill(
    bill_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific bill"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Check if user has permission to view this bill
    if current_user.role not in ['admin', 'manager'] and bill.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this bill")
    
    return bill

@app.post("/api/bills", response_model=BillSchema)
@require_staff_or_above
def create_bill(
    bill: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new bill"""
    # For now, we'll create a placeholder file path
    # In a real implementation, you'd handle file upload here
    db_bill = Bill(
        **bill.dict(),
        uploaded_by=current_user.id,
        file_path="/uploads/placeholder.pdf",  # This would be set after file upload
        file_name="placeholder.pdf",
        file_size=0,
        file_type="application/pdf"
    )
    
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

@app.put("/api/bills/{bill_id}", response_model=BillSchema)
@require_staff_or_above
def update_bill(
    bill_id: int,
    bill_update: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a bill"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Check if user has permission to update this bill
    if current_user.role not in ['admin', 'manager'] and bill.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this bill")
    
    # Only allow updates if bill is not approved
    if bill.status == 'approved':
        raise HTTPException(status_code=400, detail="Cannot update approved bill")
    
    update_data = bill_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bill, field, value)
    
    db.commit()
    db.refresh(bill)
    return bill

@app.delete("/api/bills/{bill_id}")
@require_manager_or_admin
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a bill (managers and admins only)"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted successfully"}

@app.put("/api/bills/{bill_id}/approve")
@require_manager_or_admin
def approve_bill(
    bill_id: int,
    approval_data: BillApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve or reject a bill (managers and admins only)"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
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