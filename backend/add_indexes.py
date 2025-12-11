"""
Script to add indexes to existing database tables.
This script adds indexes for foreign keys and frequently queried fields.
Run this after updating models.py to ensure existing databases have proper indexes.
"""

import sqlite3
import os
import sys
from pathlib import Path

# Get database path from environment or use default
database_path = os.getenv("DATABASE_URL", "sqlite:///backend/ams.db")
# Extract path from SQLAlchemy URL format
if database_path.startswith("sqlite:///"):
    db_file = database_path.replace("sqlite:///", "")
    if not os.path.isabs(db_file):
        # Relative path - make it relative to script location
        script_dir = Path(__file__).parent
        db_file = script_dir / db_file
else:
    db_file = database_path

# Ensure database file exists
if not os.path.exists(db_file):
    print(f"Database file not found: {db_file}")
    print("Creating database with indexes from models...")
    from models import Base
    from database import engine
    Base.metadata.create_all(bind=engine)
    print("Database created successfully!")
    sys.exit(0)

print(f"Adding indexes to database: {db_file}")

# Connect to database
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# List of indexes to create
indexes = [
    # User table indexes
    ("idx_users_role", "users", "role"),
    
    # Bill table indexes
    ("idx_bills_uploaded_by", "bills", "uploaded_by"),
    ("idx_bills_approved_by", "bills", "approved_by"),
    ("idx_bills_status", "bills", "status"),
    ("idx_bills_category", "bills", "category"),
    ("idx_bills_vendor", "bills", "vendor"),
    ("idx_bills_bill_date", "bills", "bill_date"),
    ("idx_bills_due_date", "bills", "due_date"),
    ("idx_bills_created_at", "bills", "created_at"),
    ("idx_bills_updated_at", "bills", "updated_at"),
    
    # Staff table indexes
    ("idx_staff_email", "staff", "email"),
    ("idx_staff_status", "staff", "status"),
    ("idx_staff_department", "staff", "department"),
    ("idx_staff_designation", "staff", "designation"),
    ("idx_staff_location", "staff", "location"),
    ("idx_staff_availability", "staff", "availability"),
    ("idx_staff_project", "staff", "project"),
    ("idx_staff_company", "staff", "company"),
    ("idx_staff_created_at", "staff", "created_at"),
    ("idx_staff_updated_at", "staff", "updated_at"),
    
    # Training table indexes
    ("idx_training_created_by", "training", "created_by"),
    ("idx_training_updated_by", "training", "updated_by"),
    ("idx_training_status", "training", "status"),
    ("idx_training_level", "training", "level"),
    ("idx_training_category", "training", "category"),
    ("idx_training_institution", "training", "institution"),
    ("idx_training_schedule_start_date", "training", "schedule_start_date"),
    ("idx_training_schedule_end_date", "training", "schedule_end_date"),
    ("idx_training_created_at", "training", "created_at"),
    ("idx_training_updated_at", "training", "updated_at"),
]

# Check existing indexes
cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'")
existing_indexes = {row[0] for row in cursor.fetchall()}

# Create indexes that don't exist
created_count = 0
skipped_count = 0
error_count = 0

for index_name, table_name, column_name in indexes:
    if index_name in existing_indexes:
        print(f"  ✓ Index {index_name} already exists")
        skipped_count += 1
        continue
    
    try:
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            print(f"  ⚠ Table {table_name} does not exist, skipping index {index_name}")
            skipped_count += 1
            continue
        
        # Check if column exists
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row[1] for row in cursor.fetchall()]
        if column_name not in columns:
            print(f"  ⚠ Column {table_name}.{column_name} does not exist, skipping index {index_name}")
            skipped_count += 1
            continue
        
        # Create index
        cursor.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name}({column_name})")
        print(f"  ✓ Created index {index_name} on {table_name}({column_name})")
        created_count += 1
    except sqlite3.Error as e:
        print(f"  ✗ Error creating index {index_name}: {e}")
        error_count += 1

# Commit changes
conn.commit()
conn.close()

print("\n" + "=" * 50)
print(f"Index creation complete!")
print(f"  Created: {created_count}")
print(f"  Skipped: {skipped_count}")
print(f"  Errors: {error_count}")
print("=" * 50)



