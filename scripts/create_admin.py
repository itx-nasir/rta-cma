#!/usr/bin/env python3
"""
Production Admin User Creation Script for RTA Camera Management System
Run this script to create the initial administrator user for production deployment.

Usage:
    python scripts/create_admin.py
    
Environment Variables Required:
    - ADMIN_USERNAME: Administrator username (default: admin)
    - ADMIN_EMAIL: Administrator email
    - ADMIN_FULL_NAME: Administrator full name
    - ADMIN_PASSWORD: Administrator password (will prompt if not set)
"""

import os
import sys
import getpass
from pathlib import Path

# Add the parent directory to the path to import app modules
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.auth import AuthService


def get_admin_details():
    """Get administrator details from environment or user input"""
    print("🔐 Creating RTA Camera Management System Administrator")
    print("=" * 55)
    
    # Get username
    username = os.getenv('ADMIN_USERNAME') or input("Enter admin username (default: admin): ").strip()
    if not username:
        username = "admin"
    
    # Get email
    email = os.getenv('ADMIN_EMAIL')
    while not email:
        email = input("Enter admin email: ").strip()
        if not email or '@' not in email:
            print("❌ Please enter a valid email address")
            email = None
    
    # Get full name
    full_name = os.getenv('ADMIN_FULL_NAME')
    while not full_name:
        full_name = input("Enter admin full name: ").strip()
        if not full_name:
            print("❌ Please enter a full name")
    
    # Get password
    password = os.getenv('ADMIN_PASSWORD')
    if not password:
        while True:
            password = getpass.getpass("Enter admin password: ")
            if len(password) < 8:
                print("❌ Password must be at least 8 characters long")
                continue
            
            confirm_password = getpass.getpass("Confirm admin password: ")
            if password != confirm_password:
                print("❌ Passwords do not match")
                continue
            
            break
    
    return {
        'username': username,
        'email': email,
        'full_name': full_name,
        'password': password
    }


def create_admin_user():
    """Create administrator user for production"""
    db = SessionLocal()
    
    try:
        # Get admin details
        admin_data = get_admin_details()
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(
            (User.username == admin_data['username']) | 
            (User.email == admin_data['email'])
        ).first()
        
        if existing_admin:
            print(f"\n❌ User with username '{admin_data['username']}' or email '{admin_data['email']}' already exists.")
            
            overwrite = input("Do you want to update the existing user? (y/N): ").lower().strip()
            if overwrite != 'y':
                print("Operation cancelled.")
                return
            
            # Update existing user
            existing_admin.email = admin_data['email']
            existing_admin.full_name = admin_data['full_name']
            existing_admin.hashed_password = AuthService.get_password_hash(admin_data['password'])
            existing_admin.role = UserRole.ADMINISTRATOR
            existing_admin.is_active = True
            existing_admin.is_verified = True
            
            db.commit()
            
            print(f"\n✅ Administrator user '{admin_data['username']}' updated successfully!")
        else:
            # Create new admin user
            hashed_password = AuthService.get_password_hash(admin_data['password'])
            
            admin_user = User(
                username=admin_data['username'],
                email=admin_data['email'],
                full_name=admin_data['full_name'],
                hashed_password=hashed_password,
                role=UserRole.ADMINISTRATOR,
                is_active=True,
                is_verified=True
            )
            
            db.add(admin_user)
            db.commit()
            
            print(f"\n✅ Administrator user '{admin_data['username']}' created successfully!")
        
        # Display summary
        print("\n📋 Administrator Details:")
        print(f"   Username: {admin_data['username']}")
        print(f"   Email: {admin_data['email']}")
        print(f"   Full Name: {admin_data['full_name']}")
        print(f"   Role: Administrator")
        print(f"   Status: Active")
        
        print("\n🚀 You can now log in to the RTA Camera Management System.")
        print(f"   Access the system at: http://localhost:3000")
        print(f"   Use username '{admin_data['username']}' and your password to log in.")
        
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        db.rollback()
    except Exception as e:
        print(f"\n❌ Error creating administrator user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Main function"""
    try:
        # Check database connection
        db = SessionLocal()
        db.close()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure:")
        print("  1. PostgreSQL is running")
        print("  2. Database exists and connection string is correct")
        print("  3. Run 'alembic upgrade head' to set up the database schema")
        sys.exit(1)
    
    create_admin_user()


if __name__ == "__main__":
    main()