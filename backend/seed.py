from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base
from auth import get_password_hash

def seed_users():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if users already exist
    existing_user = db.query(User).first()
    if existing_user:
        print("Users already exist in database. Skipping seeding.")
        return
    
    # Create test users with roles
    test_users = [
        {
            "email": "admin@ams.com",
            "username": "admin",
            "full_name": "Admin User",
            "password": "admin123",
            "is_superuser": True,
            "role": "admin"
        },
        {
            "email": "manager@ams.com",
            "username": "manager",
            "full_name": "Manager User",
            "password": "manager123",
            "is_superuser": False,
            "role": "manager"
        },
        {
            "email": "user@ams.com",
            "username": "user",
            "full_name": "Regular User",
            "password": "user123",
            "is_superuser": False,
            "role": "user"
        },
        {
            "email": "pending@ams.com",
            "username": "pending",
            "full_name": "Pending User",
            "password": "pending123",
            "is_superuser": False,
            "role": "pending"
        }
    ]
    
    for user_data in test_users:
        hashed_password = get_password_hash(user_data["password"])
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            full_name=user_data["full_name"],
            hashed_password=hashed_password,
            is_superuser=user_data["is_superuser"],
            role=user_data["role"]
        )
        db.add(user)
    
    db.commit()
    print("Test users created successfully!")
    print("Login credentials:")
    for user_data in test_users:
        print(f"Username: {user_data['username']}, Password: {user_data['password']}, Role:{user_data['role']}")
    
    db.close()

if __name__ == "__main__":
    seed_users() 