"""
Demo user creation script for RTA Camera Management System
Run this script to create demo users for testing the authentication system.
"""

import asyncio
import sys
import os

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.auth import AuthService

def create_demo_users():
    """Create demo users for testing"""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("Demo users already exist. Skipping creation.")
            return
        
        # Demo users data - using shorter passwords to avoid bcrypt issues
        demo_users = [
            {
                "username": "admin",
                "email": "admin@rta.gov.ae",
                "full_name": "System Administrator",
                "password": "admin123"[:50],  # Truncate to avoid bcrypt limit
                "role": UserRole.ADMINISTRATOR
            },
            {
                "username": "operator",
                "email": "operator@rta.gov.ae", 
                "full_name": "Camera Operator",
                "password": "oper123"[:50],  # Truncate to avoid bcrypt limit
                "role": UserRole.OPERATOR
            },
            {
                "username": "viewer",
                "email": "viewer@rta.gov.ae",
                "full_name": "System Viewer",
                "password": "view123"[:50],  # Truncate to avoid bcrypt limit
                "role": UserRole.VIEWER
            }
        ]
        
        created_users = []
        
        for user_data in demo_users:
            # Hash the password
            hashed_password = AuthService.get_password_hash(user_data["password"])
            
            # Create user
            db_user = User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=hashed_password,
                role=user_data["role"],
                is_active=True,
                is_verified=True
            )
            
            db.add(db_user)
            created_users.append(user_data)
        
        # Commit all users
        db.commit()
        
        print("✅ Demo users created successfully!")
        print("\nLogin Credentials:")
        print("-" * 50)
        
        for user in created_users:
            print(f"Role: {user['role'].value.title()}")
            print(f"Username: {user['username']}")
            print(f"Password: {user['password']}")
            print(f"Email: {user['email']}")
            print("-" * 30)
        
        print("\nYou can now log in to the application with these credentials.")
        print("The frontend will show these demo credentials on the login page.")
        
    except Exception as e:
        print(f"❌ Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_users()