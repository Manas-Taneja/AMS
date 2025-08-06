from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Project, Staff, Location, Component, Bill, Base
from auth import get_password_hash
from datetime import datetime, timedelta
import csv
import os
import random
from logging_config import get_logger

# Get logger for this module
logger = get_logger(__name__)

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
        
        logger.info(f"Successfully read {len(drone_components)} drone components from CSV")
        return drone_components
        
    except FileNotFoundError:
        logger.warning(f"CSV file not found at {csv_path}")
        return []
    except Exception as e:
        logger.error(f"Error reading CSV file: {e}")
        return []

def seed_users():
    """Seed users with different roles"""
    db = SessionLocal()
    
    # Check if users already exist
    existing_user = db.query(User).first()
    if existing_user:
        logger.info("Users already exist in database. Skipping user seeding.")
        db.close()
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
    logger.info("Test users created successfully!")
    logger.info("Login credentials:")
    for user_data in test_users:
        logger.info(f"Username: {user_data['username']}, Role: {user_data['role']}")
    logger.info("Passwords are not displayed for security reasons")
    
    db.close()

def seed_projects():
    """Seed projects with comprehensive data"""
    db = SessionLocal()
    
    # Check if projects already exist
    existing_project = db.query(Project).first()
    if existing_project:
        logger.info("Projects already exist in database. Skipping project seeding.")
        db.close()
        return
    
    # Sample project data with comprehensive fields
    projects_data = [
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
            "name": "Autonomous Delivery System",
            "status": "Active",
            "progress": 75,
            "category": "Logistics",
            "funding_type": "govt",
            "funding_body": "Ministry of Civil Aviation",
            "funding_received": 2500000,
            "report_links": [
                {"label": "Q1 2024 Report", "url": "https://docs.google.com/document/d/abc123"},
                {"label": "Technical Specifications", "url": "https://drive.google.com/file/d/def456"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
            "name": "Urban Surveillance Network",
            "status": "Active",
            "progress": 85,
            "category": "Security",
            "funding_type": "self",
            "funding_body": None,
            "funding_received": 1800000,
            "report_links": [
                {"label": "Security Assessment", "url": "https://docs.google.com/document/d/ghi789"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
            "name": "Precision Agriculture Platform",
            "status": "Completed",
            "progress": 100,
            "category": "Agriculture",
            "funding_type": "govt",
            "funding_body": "Department of Agriculture",
            "funding_received": 3200000,
            "report_links": [
                {"label": "Final Report", "url": "https://docs.google.com/document/d/jkl012"},
                {"label": "Implementation Guide", "url": "https://drive.google.com/file/d/mno345"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
            "name": "Aerial Survey & Mapping",
            "status": "Active",
            "progress": 60,
            "category": "Survey",
            "funding_type": "self",
            "funding_body": None,
            "funding_received": 950000,
            "report_links": [
                {"label": "Survey Results Q2", "url": "https://docs.google.com/document/d/pqr678"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
            "name": "Disaster Response System",
            "status": "Paused",
            "progress": 35,
            "category": "Emergency",
            "funding_type": "govt",
            "funding_body": "National Disaster Management Authority",
            "funding_received": 1500000,
            "report_links": [
                {"label": "Initial Assessment", "url": "https://docs.google.com/document/d/stu901"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
            "name": "Drone Pilot Training Program",
            "status": "Completed",
            "progress": 100,
            "category": "Training",
            "funding_type": "self",
            "funding_body": None,
            "funding_received": 800000,
            "report_links": [
                {"label": "Training Manual", "url": "https://docs.google.com/document/d/vwx234"},
                {"label": "Certification Standards", "url": "https://drive.google.com/file/d/yzab567"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
            "name": "Branch Expansion Initiative",
            "status": "Active",
            "progress": 90,
            "category": "Expansion",
            "funding_type": "self",
            "funding_body": None,
            "funding_received": 2100000,
            "report_links": [
                {"label": "Expansion Plan", "url": "https://docs.google.com/document/d/cdef890"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
            "name": "Technology Infrastructure Upgrade",
            "status": "Paused",
            "progress": 45,
            "category": "Technology",
            "funding_type": "govt",
            "funding_body": "Ministry of Electronics and IT",
            "funding_received": 1200000,
            "report_links": [
                {"label": "Infrastructure Assessment", "url": "https://docs.google.com/document/d/ghij123"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
            "name": "Environmental Monitoring System",
            "status": "Active",
            "progress": 70,
            "category": "Environmental",
            "funding_type": "govt",
            "funding_body": "Ministry of Environment",
            "funding_received": 2800000,
            "report_links": [
                {"label": "Environmental Impact Report", "url": "https://docs.google.com/document/d/klmn456"},
                {"label": "Monitoring Protocols", "url": "https://drive.google.com/file/d/opqr789"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
            "name": "Smart City Integration",
            "status": "Active",
            "progress": 55,
            "category": "Smart Cities",
            "funding_type": "govt",
            "funding_body": "Smart Cities Mission",
            "funding_received": 4500000,
            "report_links": [
                {"label": "Integration Plan", "url": "https://docs.google.com/document/d/stuv012"},
                {"label": "Technical Architecture", "url": "https://drive.google.com/file/d/wxyz345"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
            "name": "Rural Connectivity Project",
            "status": "Active",
            "progress": 80,
            "category": "Connectivity",
            "funding_type": "govt",
            "funding_body": "Department of Telecommunications",
            "funding_received": 3800000,
            "report_links": [
                {"label": "Connectivity Assessment", "url": "https://docs.google.com/document/d/abcd678"}
            ]
        },
        {
            "thumbnail_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
            "name": "Healthcare Delivery Drones",
            "status": "Paused",
            "progress": 25,
            "category": "Healthcare",
            "funding_type": "self",
            "funding_body": None,
            "funding_received": 750000,
            "report_links": [
                {"label": "Feasibility Study", "url": "https://docs.google.com/document/d/efgh901"}
            ]
        }
    ]
    
    for project_data in projects_data:
        # Convert report_links to JSON string for storage
        if project_data.get("report_links"):
            import json
            project_data["report_links"] = json.dumps(project_data["report_links"])
        
        project = Project(**project_data)
        db.add(project)
    
    db.commit()
    logger.info(f"Successfully created {len(projects_data)} projects!")
    
    # Log project summary
    categories = db.query(Project.category).distinct().all()
    statuses = db.query(Project.status).distinct().all()
    funding_types = db.query(Project.funding_type).distinct().all()
    
    logger.info("Project Summary:")
    logger.info(f"Total projects: {db.query(Project).count()}")
    logger.info(f"Categories: {[cat[0] for cat in categories if cat[0]]}")
    logger.info(f"Statuses: {[status[0] for status in statuses if status[0]]}")
    logger.info(f"Funding types: {[fund[0] for fund in funding_types if fund[0]]}")
    
    # Log project distribution by status
    for status in statuses:
        if status[0]:
            status_name = status[0]
            count = db.query(Project).filter(Project.status == status_name).count()
            logger.info(f"  {status_name}: {count} projects")
    
    # Log total funding received
    total_funding = db.query(Project.funding_received).filter(Project.funding_received.isnot(None)).all()
    total_amount = sum(fund[0] for fund in total_funding if fund[0])
    logger.info(f"Total funding received: ₹{total_amount:,}")
    
    db.close()

def seed_staff():
    """Seed staff members with comprehensive data"""
    db = SessionLocal()
    
    # Check if staff already exist
    existing_staff = db.query(Staff).first()
    if existing_staff:
        logger.info("Staff already exist in database. Skipping staff seeding.")
        db.close()
        return
    
    # Sample staff data with comprehensive fields
    staff_data = [
        {
            "name": "Anurag Sharma",
            "email": "anurag.sharma@pssl.com",
            "phone": "+91-9876543210",
            "department": "Engineering",
            "status": "active",
            "designation": "Project Associate (Drone)",
            "skills": "Drone Pilot, Procurement",
            "location": "PSSL Headquarters",
            "availability": "available",
            "project": "Autonomous Delivery System",
            "company": "PSSL",
            "experience": "5 years",
            "joinDate": "2020-04-15",
            "reports_to": "Dr. Rajesh Kumar"
        },
        {
            "name": "Priya Singh",
            "email": "priya.singh@iidt.org",
            "phone": "+91-9988776655",
            "department": "Technology",
            "status": "active",
            "designation": "CTO",
            "skills": "Flight Control, Telemetry",
            "location": "IIDT Research Center",
            "availability": "busy",
            "project": "Urban Surveillance Network",
            "company": "IIDT",
            "experience": "10 years",
            "joinDate": "2018-01-10",
            "reports_to": "Prof. Priya Sharma"
        },
        {
            "name": "Carol Lee",
            "email": "carol.lee@iidt.org",
            "phone": "+91-9123456780",
            "department": "Finance",
            "status": "active",
            "designation": "CFO",
            "skills": "Budgeting, Vendor Management",
            "location": "IIDT Research Center",
            "availability": "available",
            "project": "Precision Agriculture Platform",
            "company": "IIDT",
            "experience": "8 years",
            "joinDate": "2019-07-01",
            "reports_to": "Prof. Priya Sharma"
        },
        {
            "name": "David Kim",
            "email": "david.kim@prakharaviation.com",
            "phone": "+91-9001122334",
            "department": "Engineering",
            "status": "inactive",
            "designation": "Engineering Manager",
            "skills": "Payload Integration, FPV, Drone Pilot",
            "location": "Prakhar Aviation Training Center",
            "availability": "unavailable",
            "project": "Drone Pilot Training Program",
            "company": "Prakhar Aviation",
            "experience": "12 years",
            "joinDate": "2017-11-20",
            "reports_to": "Capt. Amit Singh"
        },
        {
            "name": "Eva Brown",
            "email": "eva.brown@pssl.com",
            "phone": "+91-9090909090",
            "department": "Engineering",
            "status": "active",
            "designation": "Lead Engineer",
            "skills": "Aerial Mapping, Battery Management",
            "location": "PSSL Branch Office - Mumbai",
            "availability": "available",
            "project": "Aerial Survey & Mapping",
            "company": "PSSL",
            "experience": "7 years",
            "joinDate": "2021-03-12",
            "reports_to": "Ms. Sneha Patel"
        },
        {
            "name": "Frank Green",
            "email": "frank.green@iidt.org",
            "phone": "+91-8888888888",
            "department": "Finance",
            "status": "active",
            "designation": "Accountant",
            "skills": "Cost Analysis, Procurement",
            "location": "IIDT Satellite Office - Chennai",
            "availability": "busy",
            "project": "Precision Agriculture Platform",
            "company": "IIDT",
            "experience": "6 years",
            "joinDate": "2022-06-01",
            "reports_to": "Prof. Priya Sharma"
        },
        {
            "name": "Grace White",
            "email": "grace.white@prakharaviation.com",
            "phone": "+91-9876501234",
            "department": "Engineering",
            "status": "active",
            "designation": "Engineer",
            "skills": "FPV, Telemetry",
            "location": "Prakhar Aviation Maintenance Hub",
            "availability": "available",
            "project": "Fleet Maintenance",
            "company": "Prakhar Aviation",
            "experience": "4 years",
            "joinDate": "2023-01-15",
            "reports_to": "Mr. Deepak Verma"
        },
        {
            "name": "Henry Black",
            "email": "henry.black@pssl.com",
            "phone": "+91-9988001122",
            "department": "Engineering",
            "status": "active",
            "designation": "Engineer",
            "skills": "Battery Management, Flight Control",
            "location": "PSSL Data Center",
            "availability": "busy",
            "project": "Data Processing Center",
            "company": "PSSL",
            "experience": "3 years",
            "joinDate": "2022-09-10",
            "reports_to": "Mr. Arjun Mehta"
        },
        {
            "name": "Meera Joshi",
            "email": "meera.joshi@iidt.org",
            "phone": "+91-9000090000",
            "department": "Research",
            "status": "active",
            "designation": "Research Scientist",
            "skills": "Environmental Monitoring, Data Analysis",
            "location": "IIDT Field Station - Dehradun",
            "availability": "available",
            "project": "Environmental Monitoring System",
            "company": "IIDT",
            "experience": "9 years",
            "joinDate": "2020-12-01",
            "reports_to": "Dr. Meera Joshi"
        },
        {
            "name": "Deepak Verma",
            "email": "deepak.verma@prakharaviation.com",
            "phone": "+91-9876543211",
            "department": "Maintenance",
            "status": "active",
            "designation": "Maintenance Lead",
            "skills": "Fleet Management, Repairs",
            "location": "Prakhar Aviation Maintenance Hub",
            "availability": "available",
            "project": "Fleet Maintenance",
            "company": "Prakhar Aviation",
            "experience": "11 years",
            "joinDate": "2016-08-05",
            "reports_to": "Capt. Amit Singh"
        }
    ]
    
    for staff in staff_data:
        db_staff = Staff(
            name=staff["name"],
            email=staff["email"],
            department=staff["department"],
            status=staff["status"],
            designation=staff["designation"],
            skills=staff["skills"],
            location=staff["location"],
            availability=staff["availability"],
            project=staff["project"],
            company=staff["company"],
            reports_to=staff["reports_to"],
            # Additional fields for frontend display
            # phone, experience, joinDate are not in the DB model by default, but can be added if the model is extended
        )
        db.add(db_staff)
    
    db.commit()
    logger.info(f"Successfully created {len(staff_data)} staff members!")
    db.close()

def seed_locations():
    """Seed locations with comprehensive data"""
    db = SessionLocal()
    
    # Check if locations already exist
    existing_location = db.query(Location).first()
    if existing_location:
        logger.info("Locations already exist in database. Skipping location seeding.")
        db.close()
        return
    
    # Sample location data with comprehensive fields
    locations_data = [
        {
            "name": "PSSL Headquarters",
            "address": "123 Innovation Drive, Malviya Nagar, Jaipur, Rajasthan 302017",
            "team": 25,
            "manager": "Dr. Rajesh Kumar",
            "project": "Autonomous Delivery System"
        },
        {
            "name": "IIDT Research Center",
            "address": "456 Technology Park, Sector 62, Noida, Uttar Pradesh 201301",
            "team": 18,
            "manager": "Prof. Priya Sharma",
            "project": "Urban Surveillance Network"
        },
        {
            "name": "Prakhar Aviation Training Center",
            "address": "789 Aviation Road, HAL Airport, Bangalore, Karnataka 560017",
            "team": 12,
            "manager": "Capt. Amit Singh",
            "project": "Drone Pilot Training"
        },
        {
            "name": "PSSL Branch Office - Mumbai",
            "address": "321 Business District, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
            "team": 15,
            "manager": "Ms. Sneha Patel",
            "project": "Aerial Survey Operations"
        },
        {
            "name": "IIDT Satellite Office - Chennai",
            "address": "654 IT Corridor, OMR Road, Chennai, Tamil Nadu 600113",
            "team": 8,
            "manager": "Mr. Karthik Reddy",
            "project": "Precision Agriculture"
        },
        {
            "name": "Prakhar Aviation Maintenance Hub",
            "address": "987 Industrial Area, Phase 2, Gurgaon, Haryana 122015",
            "team": 10,
            "manager": "Mr. Deepak Verma",
            "project": "Fleet Maintenance"
        },
        {
            "name": "PSSL Data Center",
            "address": "147 Server Street, Electronic City, Bangalore, Karnataka 560100",
            "team": 6,
            "manager": "Mr. Arjun Mehta",
            "project": "Data Processing Center"
        },
        {
            "name": "IIDT Field Station - Dehradun",
            "address": "258 Forest Road, Dehradun, Uttarakhand 248001",
            "team": 5,
            "manager": "Dr. Meera Joshi",
            "project": "Environmental Monitoring"
        }
    ]
    
    for location_data in locations_data:
        location = Location(**location_data)
        db.add(location)
    
    db.commit()
    logger.info(f"Successfully created {len(locations_data)} locations!")
    db.close()

def seed_components():
    """Seed components with comprehensive data including both CSV and additional samples"""
    db = SessionLocal()
    
    # Read drone data from CSV
    drone_components = read_drone_csv()
    
    # Check if any components exist
    existing_component = db.query(Component).first()
    if existing_component:
        logger.info(f"Found {db.query(Component).count()} existing components. Skipping component seeding.")
        db.close()
        return
    
    # Add drone components from CSV
    for component_data in drone_components:
        component = Component(**component_data)
        db.add(component)
    
    # Add additional sample components beyond CSV data
    additional_components = [
        {
            "name": "DJI Mavic 3 Pro",
            "category": "Drones",
            "status": "Active",
            "location": "PSSL Headquarters",
            "project": "Aerial Survey",
            "owner": "PSSL",
            "description": "Professional drone for aerial photography and mapping with 4K camera",
            "serial_number": "DJIM3P-PSSL-001",
            "purchase_date": datetime.now() - timedelta(days=365),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        },
        {
            "name": "Thermal Imaging Camera",
            "category": "Sensors",
            "status": "Active",
            "location": "IIDT Research Center",
            "project": "Search and Rescue",
            "owner": "IIDT",
            "description": "High-resolution thermal imaging camera for night operations",
            "serial_number": "THCAM-IIDT-002",
            "purchase_date": datetime.now() - timedelta(days=300),
            "warranty_expiry": datetime.now() + timedelta(days=665)
        },
        {
            "name": "RTK GPS Module",
            "category": "Navigation",
            "status": "Active",
            "location": "Prakhar Aviation Training Center",
            "project": "Precision Agriculture",
            "owner": "Prakhar Aviation",
            "description": "Real-time kinematic GPS for centimeter accuracy positioning",
            "serial_number": "RTKGPS-PAV-003",
            "purchase_date": datetime.now() - timedelta(days=240),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        },
        {
            "name": "LiDAR Scanner",
            "category": "Sensors",
            "status": "Maintenance",
            "location": "PSSL Branch Office - Mumbai",
            "project": "3D Mapping",
            "owner": "PSSL",
            "description": "Light Detection and Ranging scanner for 3D terrain mapping",
            "serial_number": "LIDAR-PSSL-004",
            "purchase_date": datetime.now() - timedelta(days=180),
            "warranty_expiry": datetime.now() + timedelta(days=545)
        },
        {
            "name": "Multispectral Camera",
            "category": "Sensors",
            "status": "Active",
            "location": "IIDT Satellite Office - Chennai",
            "project": "Precision Agriculture",
            "owner": "IIDT",
            "description": "Camera for capturing multiple spectral bands for crop analysis",
            "serial_number": "MSCAM-IIDT-005",
            "purchase_date": datetime.now() - timedelta(days=120),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        },
        {
            "name": "Drone Battery Pack",
            "category": "Accessories",
            "status": "Active",
            "location": "Prakhar Aviation Maintenance Hub",
            "project": "Fleet Maintenance",
            "owner": "Prakhar Aviation",
            "description": "High-capacity lithium battery pack for extended flight time",
            "serial_number": "BAT-PAV-006",
            "purchase_date": datetime.now() - timedelta(days=90),
            "warranty_expiry": datetime.now() + timedelta(days=365)
        },
        {
            "name": "Ground Control Station",
            "category": "Control Systems",
            "status": "Active",
            "location": "PSSL Data Center",
            "project": "Data Processing Center",
            "owner": "PSSL",
            "description": "Computer system for monitoring and controlling drone operations",
            "serial_number": "GCS-PSSL-007",
            "purchase_date": datetime.now() - timedelta(days=60),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        },
        {
            "name": "Weather Station",
            "category": "Sensors",
            "status": "Active",
            "location": "IIDT Field Station - Dehradun",
            "project": "Environmental Monitoring",
            "owner": "IIDT",
            "description": "Automated weather monitoring station for flight planning",
            "serial_number": "WS-IIDT-008",
            "purchase_date": datetime.now() - timedelta(days=30),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        },
        {
            "name": "Drone Propeller Set",
            "category": "Accessories",
            "status": "Idle",
            "location": "Prakhar Aviation Maintenance Hub",
            "project": "Fleet Maintenance",
            "owner": "Prakhar Aviation",
            "description": "Set of 4 high-efficiency propellers for drone replacement",
            "serial_number": "PROP-PAV-009",
            "purchase_date": datetime.now() - timedelta(days=15),
            "warranty_expiry": datetime.now() + timedelta(days=180)
        },
        {
            "name": "Payload Gimbal",
            "category": "Accessories",
            "status": "Active",
            "location": "PSSL Headquarters",
            "project": "Aerial Survey",
            "owner": "PSSL",
            "description": "3-axis gimbal for stabilizing camera payload during flight",
            "serial_number": "GIMBAL-PSSL-010",
            "purchase_date": datetime.now() - timedelta(days=7),
            "warranty_expiry": datetime.now() + timedelta(days=730)
        }
    ]
    
    # Add additional components
    for component_data in additional_components:
        component = Component(**component_data)
        db.add(component)
    
    db.commit()
    logger.info(f"Successfully added {len(drone_components)} drone components from CSV!")
    logger.info(f"Successfully added {len(additional_components)} additional components!")
    
    # Log summary
    categories = db.query(Component.category).distinct().all()
    owners = db.query(Component.owner).distinct().all()
    statuses = db.query(Component.status).distinct().all()
    
    logger.info("Component Summary:")
    logger.info(f"Total components: {db.query(Component).count()}")
    logger.info(f"Categories: {[cat[0] for cat in categories]}")
    logger.info(f"Owners: {[owner[0] for owner in owners]}")
    logger.info(f"Statuses: {[status[0] for status in statuses]}")
    
    # Log component distribution by owner
    for owner in owners:
        owner_name = owner[0]
        count = db.query(Component).filter(Component.owner == owner_name).count()
        logger.info(f"  {owner_name}: {count} components")
    
    db.close()

def seed_bills():
    """Seed bills"""
    db = SessionLocal()
    
    # Check if bills already exist
    existing_bill = db.query(Bill).first()
    if existing_bill:
        logger.info("Bills already exist in database. Skipping bill seeding.")
        db.close()
        return
    
    # Get a user to assign as uploader
    user = db.query(User).first()
    if not user:
        logger.warning("No users found. Please seed users first.")
        db.close()
        return
    
    # Sample bill data
    bills_data = [
        {
            "title": "Monthly Electricity Bill",
            "description": "Electricity consumption for headquarters",
            "amount": 1250.50,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=5),
            "due_date": datetime.now() + timedelta(days=15),
            "vendor": "Electricity Co.",
            "category": "Utilities",
            "status": "approved",
            "file_path": "/uploads/electricity_bill.pdf",
            "file_name": "electricity_bill.pdf",
            "file_size": 245760,
            "file_type": "application/pdf",
            "uploaded_by": user.id,
            "notes": "Approved for payment"
        },
        {
            "title": "Internet Service Subscription",
            "description": "High-speed internet for all locations",
            "amount": 899.99,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=10),
            "due_date": datetime.now() + timedelta(days=20),
            "vendor": "Internet Provider Inc.",
            "category": "Services",
            "status": "pending",
            "file_path": "/uploads/internet_bill.pdf",
            "file_name": "internet_bill.pdf",
            "file_size": 189440,
            "file_type": "application/pdf",
            "uploaded_by": user.id
        },
        {
            "title": "Office Supplies Order",
            "description": "Paper, pens, and other office supplies",
            "amount": 345.75,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=3),
            "due_date": datetime.now() + timedelta(days=30),
            "vendor": "OfficeMax Supplies",
            "category": "Office Supplies",
            "status": "paid",
            "file_path": "/uploads/supplies_invoice.pdf",
            "file_name": "supplies_invoice.pdf",
            "file_size": 156672,
            "file_type": "application/pdf",
            "uploaded_by": user.id,
            "notes": "Payment completed"
        },
        {
            "title": "Software License Renewal",
            "description": "Annual renewal for development tools",
            "amount": 2500.00,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=15),
            "due_date": datetime.now() + timedelta(days=45),
            "vendor": "Software Solutions Ltd.",
            "category": "Software",
            "status": "approved",
            "file_path": "/uploads/software_license.pdf",
            "file_name": "software_license.pdf",
            "file_size": 321024,
            "file_type": "application/pdf",
            "uploaded_by": user.id,
            "notes": "Approved - essential for development"
        },
        {
            "title": "Equipment Maintenance",
            "description": "Quarterly maintenance for drone fleet",
            "amount": 1800.00,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=7),
            "due_date": datetime.now() + timedelta(days=25),
            "vendor": "Maintenance Plus",
            "category": "Services",
            "status": "pending",
            "file_path": "/uploads/maintenance_bill.pdf",
            "file_name": "maintenance_bill.pdf",
            "file_size": 278528,
            "file_type": "application/pdf",
            "uploaded_by": user.id
        },
        {
            "title": "Business Travel Expenses",
            "description": "Flight and accommodation for client meeting",
            "amount": 1250.00,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=12),
            "due_date": datetime.now() + timedelta(days=18),
            "vendor": "Travel Express",
            "category": "Travel",
            "status": "rejected",
            "file_path": "/uploads/travel_expenses.pdf",
            "file_name": "travel_expenses.pdf",
            "file_size": 198656,
            "file_type": "application/pdf",
            "uploaded_by": user.id,
            "notes": "Rejected - missing receipts"
        },
        {
            "title": "Cloud Hosting Services",
            "description": "Monthly cloud hosting for applications",
            "amount": 650.00,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=2),
            "due_date": datetime.now() + timedelta(days=28),
            "vendor": "CloudHost Pro",
            "category": "Services",
            "status": "pending",
            "file_path": "/uploads/cloud_hosting.pdf",
            "file_name": "cloud_hosting.pdf",
            "file_size": 145920,
            "file_type": "application/pdf",
            "uploaded_by": user.id
        },
        {
            "title": "Drone Equipment Purchase",
            "description": "New surveillance drone for security team",
            "amount": 3500.00,
            "currency": "USD",
            "bill_date": datetime.now() - timedelta(days=20),
            "due_date": datetime.now() + timedelta(days=10),
            "vendor": "TechCorp Solutions",
            "category": "Equipment",
            "status": "approved",
            "file_path": "/uploads/drone_purchase.pdf",
            "file_name": "drone_purchase.pdf",
            "file_size": 456704,
            "file_type": "application/pdf",
            "uploaded_by": user.id,
            "notes": "Approved - critical for operations"
        }
    ]
    
    for bill_data in bills_data:
        bill = Bill(**bill_data)
        db.add(bill)
    
    db.commit()
    logger.info(f"Successfully created {len(bills_data)} bills!")
    db.close()

def seed_all():
    """Seed all data in the correct order"""
    logger.info("Starting database seeding...")
    logger.info("=" * 50)
    
    # Create database tables first
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    
    # Seed in dependency order
    seed_users()
    seed_projects()
    seed_staff()
    seed_locations()
    seed_components()
    seed_bills()
    
    logger.info("=" * 50)
    logger.info("Database seeding completed successfully!")
    logger.info("Summary:")
    logger.info("- Users: Test accounts with different roles")
    logger.info("- Projects: 8 sample projects")
    logger.info("- Staff: 8 staff members")
    logger.info("- Locations: 5 office locations")
    logger.info("- Components: Drone components from CSV")
    logger.info("- Bills: 8 sample bills")
    logger.info("Login with any of the test users:")
    logger.info("  admin/admin123, manager/manager123, user/user123")

if __name__ == "__main__":
    seed_all() 

    