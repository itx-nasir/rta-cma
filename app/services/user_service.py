from sqlalchemy.orm import Session, joinedload
from typing import Optional, Tuple, List
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserPasswordUpdate
from app.core.auth import AuthService
from datetime import datetime


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    # Check if username already exists
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    
    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Hash the password
    hashed_password = AuthService.get_password_hash(user.password)
    
    # Create user
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        assigned_location_id=user.assigned_location_id,
        is_verified=True,  # Auto-verify for now
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
) -> Tuple[List[User], int]:
    """Get users with filtering and pagination"""
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_filter)) |
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users, total


def get_user_by_id(db: Session, user_id: int, include_location: bool = False) -> Optional[User]:
    """Get user by ID"""
    query = db.query(User)
    
    if include_location:
        query = query.options(joinedload(User.assigned_location))
    
    return query.filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        return None
    
    # Check for email/username conflicts if they're being updated
    if user_update.email and user_update.email != db_user.email:
        existing = db.query(User).filter(User.email == user_update.email, User.id != user_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_password(
    db: Session, 
    user_id: int, 
    password_update: UserPasswordUpdate,
    current_user: User
) -> bool:
    """Update user password"""
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        return False
    
    # Check if current user can update this password
    if current_user.id != user_id and not current_user.is_administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user's password"
        )
    
    # Verify current password (only if user is updating their own password)
    if current_user.id == user_id:
        if not AuthService.verify_password(password_update.current_password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
    
    # Update password
    db_user.hashed_password = AuthService.get_password_hash(password_update.new_password)
    db_user.updated_at = datetime.utcnow()
    db.commit()
    return True


def delete_user(db: Session, user_id: int, current_user: User) -> bool:
    """Delete user (soft delete by deactivating)"""
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        return False
    
    # Prevent self-deletion
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Deactivate instead of hard delete
    db_user.is_active = False
    db_user.updated_at = datetime.utcnow()
    db.commit()
    return True


def activate_user(db: Session, user_id: int) -> Optional[User]:
    """Activate a deactivated user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        return None
    
    db_user.is_active = True
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users_by_role(db: Session, role: UserRole) -> List[User]:
    """Get all users with specific role"""
    return db.query(User).filter(User.role == role, User.is_active == True).all()


def get_users_by_location(db: Session, location_id: int) -> List[User]:
    """Get all users assigned to a specific location"""
    return db.query(User).filter(
        User.assigned_location_id == location_id, 
        User.is_active == True
    ).all()