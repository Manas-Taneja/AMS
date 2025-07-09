from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Project, Base
from datetime import datetime

def seed_projects():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Check if projects already exist
    existing_project = db.query(Project).first()
    if existing_project:
        print("Projects already exist in database. Skipping seeding.")
        return
    # Sample project data
    projects_data = [
        {"thumbnail_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", "name": "Urban Surveillance", "status": "Active", "progress": 78},
        {"thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", "name": "Autonomous Delivery", "status": "Paused", "progress": 45},
        {"thumbnail_url": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80", "name": "Crop Monitoring", "status": "Completed", "progress": 100},
        {"thumbnail_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", "name": "Aerial Survey", "status": "Active", "progress": 62},
        {"thumbnail_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", "name": "Disaster Response", "status": "Paused", "progress": 30},
        {"thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", "name": "Training Initiative", "status": "Completed", "progress": 100},
        {"thumbnail_url": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80", "name": "Branch Expansion", "status": "Active", "progress": 85},
        {"thumbnail_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", "name": "Tech Upgrade", "status": "Paused", "progress": 55},
    ]
    for project_data in projects_data:
        project = Project(**project_data)
        db.add(project)
    db.commit()
    print(f"Successfully created {len(projects_data)} projects!")
    db.close()

if __name__ == "__main__":
    seed_projects() 