from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Staff, Base
from datetime import datetime

def seed_staff():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Check if staff already exist
    existing_staff = db.query(Staff).first()
    if existing_staff:
        print("Staff already exist in database. Skipping seeding.")
        return
    # Sample staff data
    staff_data = [
        {"name": "Anurag", "designation": "Project Associate(Drone)", "skills": ["Drone Pilot", "Procurement"], "location": "Malviya Nagar", "availability": "Available", "project": "FPV, FPV-2, FPV-3", "company": "PSSL"},
        {"name": "Bob Smith", "designation": "CTO", "skills": ["Flight Control", "Telemetry"], "location": "San Francisco", "availability": "In Transit", "project": "Autonomous Delivery", "company": "Prakhar Aviation"},
        {"name": "Carol Lee", "designation": "CFO", "skills": ["Budgeting", "Vendor Management"], "location": "Chicago", "availability": "Available", "project": "Fleet Expansion", "company": "IIDT"},
        {"name": "David Kim", "designation": "Engineering Manager", "skills": ["Payload Integration", "FPV", "Drone Pilot"], "location": "Remote", "availability": "On Leave", "project": "Disaster Response", "company": "IIDT"},
        {"name": "Eva Brown", "designation": "Lead Engineer", "skills": ["Aerial Mapping", "Battery Management"], "location": "Remote", "availability": "Available", "project": "Crop Monitoring", "company": "PSSL"},
        {"name": "Frank Green", "designation": "Accountant", "skills": ["Cost Analysis", "Procurement"], "location": "Chicago", "availability": "Available", "project": "Fleet Expansion", "company": "IIDT"},
        {"name": "Grace White", "designation": "Engineer", "skills": ["FPV", "Telemetry"], "location": "Remote", "availability": "In Transit", "project": "Aerial Survey", "company": "Prakhar Aviation"},
        {"name": "Henry Black", "designation": "Engineer", "skills": ["Battery Management", "Flight Control"], "location": "Remote", "availability": "Available", "project": "Crop Monitoring", "company": "Prakhar Aviation"},
    ]
    for staff in staff_data:
        db_staff = Staff(
            name=staff["name"],
            designation=staff["designation"],
            skills=",".join(staff["skills"]),
            location=staff["location"],
            availability=staff["availability"],
            project=staff["project"],
            company=staff["company"]
        )
        db.add(db_staff)
    db.commit()
    print(f"Successfully created {len(staff_data)} staff members!")
    db.close()

if __name__ == "__main__":
    seed_staff() 