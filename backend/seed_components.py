from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Component, Base
from datetime import datetime, timedelta
import csv
import os

def read_drone_csv():
    """Read drone data from CSV file and return list of component dictionaries"""
    drone_components = []
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'DroneDataSheet.csv')
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Extract location information
                project_location = row['Project 1 Location'] if row['Project 1 Location'] != 'NA' else 'Unknown'
                storage_location = row['Storage Location 1'] if row['Storage Location 1'] != 'NA' else 'Unknown'
                
                # Determine primary location (prefer project location if available)
                primary_location = project_location if project_location != 'Unknown' else storage_location
                
                # Generate serial number based on asset name and category
                serial_number = f"{row['Asset Name'].replace(' ', '')[:5].upper()}-{row['Category'][:3].upper()}-{len(drone_components) + 1:03d}"
                
                # Create component data
                component_data = {
                    "name": row['Asset Name'],
                    "category": row['Category'],
                    "status": "Active",  # Default status
                    "location": primary_location,
                    "project": f"{row['Category']} Project",  # Create project name from category
                    "owner": "Prakhar Aviation",  # Default owner
                    "description": f"{row['Category']} drone - Quantity: {row['Quantity']}",
                    "serial_number": serial_number,
                    "purchase_date": datetime.now() - timedelta(days=365),  # Default purchase date
                    "warranty_expiry": datetime.now() + timedelta(days=730)  # Default warranty
                }
                drone_components.append(component_data)
        
        print(f"Successfully read {len(drone_components)} drone components from CSV")
        return drone_components
        
    except FileNotFoundError:
        print(f"CSV file not found at {csv_path}")
        return []
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

def seed_components():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Read drone data from CSV
    drone_components = read_drone_csv()
    
    # Check if any components exist
    existing_component = db.query(Component).first()
    if existing_component:
        print(f"Found {db.query(Component).count()} existing components. Skipping seeding.")
        return
    
    # Add drone components from CSV
    for component_data in drone_components:
        component = Component(**component_data)
        db.add(component)
    
    db.commit()
    print(f"Successfully added {len(drone_components)} drone components from CSV!")
    
    # Print summary
    categories = db.query(Component.category).distinct().all()
    owners = db.query(Component.owner).distinct().all()
    statuses = db.query(Component.status).distinct().all()
    
    print(f"\nSummary:")
    print(f"Total components: {db.query(Component).count()}")
    print(f"Categories: {[cat[0] for cat in categories]}")
    print(f"Owners: {[owner[0] for owner in owners]}")
    print(f"Statuses: {[status[0] for status in statuses]}")
    
    # Print drone-specific summary
    drone_components_in_db = db.query(Component).filter(Component.category.in_(['Surveillance', 'Flight Controller', 'Mapping', 'Defense'])).all()
    print(f"\nDrone Components Summary:")
    print(f"Total drone components: {len(drone_components_in_db)}")
    for drone in drone_components_in_db:
        print(f"  - {drone.name} ({drone.category}) at {drone.location}")
    
    db.close()

if __name__ == "__main__":
    seed_components() 