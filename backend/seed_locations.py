from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Location, Base
from datetime import datetime

def seed_locations():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Check if locations already exist
    existing_location = db.query(Location).first()
    if existing_location:
        print("Locations already exist in database. Skipping seeding.")
        return
    # Sample location data
    locations_data = [
        {"name": "Headquarters", "address": "123 Main St, City", "team": 12, "manager": "John Smith", "project": "Urban Surveillance"},
        {"name": "Branch Office A", "address": "456 Oak Ave, City", "team": 8, "manager": "Sarah Johnson", "project": "Autonomous Delivery"},
        {"name": "Branch Office B", "address": "789 Pine Rd, City", "team": 6, "manager": "Mike Wilson", "project": "Aerial Survey"},
        {"name": "Warehouse", "address": "321 Storage Ln, City", "team": 10, "manager": "Lisa Chen", "project": "Inventory Optimization"},
        {"name": "Training Centre - South", "address": "654 Training Blvd, City", "team": 4, "manager": "Alex Lee", "project": "Staff Training"},
    ]
    for location_data in locations_data:
        location = Location(**location_data)
        db.add(location)
    db.commit()
    print(f"Successfully created {len(locations_data)} locations!")
    db.close()

if __name__ == "__main__":
    seed_locations() 