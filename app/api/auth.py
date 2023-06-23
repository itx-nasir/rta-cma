from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.core.auth import AuthService
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate, UserRead, UserUpdate, UserPasswordUpdate, 
    UserLogin, LoginResponse, UserProfile, UserListResponse
)
from app.services.user_service import (
    create_user, get_users, get_user_by_id, update_user, 
    update_user_password, delete_user, activate_user,
    get_users_by_role, get_users_by_location
)

router = APIRouter()
security = HTTPBearer()


# Dependency to get current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    return AuthService.get_current_user(db, token)


# Dependency to require administrator role
def require_administrator(current_user: User = Depends(get_current_user)) -> User:
    """Require administrator role"""
    if not current_user.is_administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    return current_user


# Dependency to require admin or operator role
def require_admin_or_operator(current_user: User = Depends(get_current_user)) -> User:
    """Require administrator or operator role"""
    if not (current_user.is_administrator or current_user.is_operator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or Operator access required"
        )
    return current_user


@router.post("/login", response_model=LoginResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    user = AuthService.authenticate_user(db, user_credentials.username, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token
    token_data = AuthService.create_user_token(user)
    
    # Prepare user profile
    user_profile = UserProfile(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login,
        assigned_location_id=user.assigned_location_id,
        can_create=user.can_create(),
        can_edit=user.can_edit(),
        can_delete=user.can_delete(),
        can_manage_users=user.can_manage_users()
    )
    
    return LoginResponse(
        access_token=token_data["access_token"],
        token_type=token_data["token_type"],
        expires_in=token_data["expires_in"],
        user=user_profile
    )


@router.post("/register", response_model=UserRead)
def register(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Register a new user (Admin only)"""
    return create_user(db, user_data)


@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        assigned_location_id=current_user.assigned_location_id,
        can_create=current_user.can_create(),
        can_edit=current_user.can_edit(),
        can_delete=current_user.can_delete(),
        can_manage_users=current_user.can_manage_users()
    )


@router.put("/me", response_model=UserProfile)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    # Users can only update their own basic info, not role
    restricted_update = UserUpdate(
        email=user_update.email,
        full_name=user_update.full_name,
        # Don't allow role or location changes for self-update
    )
    
    updated_user = update_user(db, current_user.id, restricted_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(
        id=updated_user.id,
        email=updated_user.email,
        username=updated_user.username,
        full_name=updated_user.full_name,
        role=updated_user.role,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at,
        last_login=updated_user.last_login,
        assigned_location_id=updated_user.assigned_location_id,
        can_create=updated_user.can_create(),
        can_edit=updated_user.can_edit(),
        can_delete=updated_user.can_delete(),
        can_manage_users=updated_user.can_manage_users()
    )


@router.put("/me/password")
def update_my_password(
    password_update: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user password"""
    success = update_user_password(db, current_user.id, password_update, current_user)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update password")
    
    return {"message": "Password updated successfully"}


@router.get("/users", response_model=UserListResponse)
def get_all_users(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search users by username, email, or name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Get all users (Admin only)"""
    users, total = get_users(db, skip=skip, limit=limit, role=role, is_active=is_active, search=search)
    
    return UserListResponse(
        users=users,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit
    )


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Get user by ID (Admin only)"""
    user = get_user_by_id(db, user_id, include_location=True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserRead)
def update_user_by_admin(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Update user by admin"""
    updated_user = update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.put("/users/{user_id}/password")
def reset_user_password(
    user_id: int,
    password_update: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Reset user password (Admin only)"""
    success = update_user_password(db, user_id, password_update, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Password reset successfully"}


@router.delete("/users/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Deactivate user (Admin only)"""
    success = delete_user(db, user_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deactivated successfully"}


@router.put("/users/{user_id}/activate", response_model=UserRead)
def activate_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Activate user (Admin only)"""
    user = activate_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/users/role/{role}", response_model=List[UserRead])
def get_users_by_role_endpoint(
    role: UserRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_administrator)
):
    """Get users by role (Admin only)"""
    return get_users_by_role(db, role)


@router.get("/users/location/{location_id}", response_model=List[UserRead])
def get_users_by_location_endpoint(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_operator)
):
    """Get users by location"""
    return get_users_by_location(db, location_id)