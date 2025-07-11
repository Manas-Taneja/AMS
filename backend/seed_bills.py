from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Bill, Base, User
from datetime import datetime, timedelta
import random

def seed_bills():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if bills already exist
    existing_bill = db.query(Bill).first()
    if existing_bill:
        print("Bills already exist in database. Skipping seeding.")
        return
    
    # Get a user to assign as uploader
    user = db.query(User).first()
    if not user:
        print("No users found. Please seed users first.")
        return
    
    # Sample bill data
    vendors = [
        "TechCorp Solutions", "OfficeMax Supplies", "CloudHost Pro", 
        "Electricity Co.", "Internet Provider Inc.", "Maintenance Plus",
        "Software Solutions Ltd.", "Travel Express", "Equipment Rentals"
    ]
    
    categories = ["Utilities", "Equipment", "Services", "Software", "Travel", "Office Supplies"]
    
    statuses = ["pending", "approved", "rejected", "paid"]
    
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
    print(f"Successfully created {len(bills_data)} bills!")
    db.close()

if __name__ == "__main__":
    seed_bills() 