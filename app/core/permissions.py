from functools import wraps
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Callable
from app.db.session import get_db
from app.core.auth import AuthService
from app.models.user import User, UserRole

security = HTTPBearer()


# Base dependency to get current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    return AuthService.get_current_user(db, token)


# Optional authentication (for endpoints that work with or without auth)
def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user (optional)"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        return AuthService.get_current_user(db, token)
    except HTTPException:
        return None


# Role-based permission dependencies
def require_role(allowed_roles: List[UserRole]):
    """Dependency factory to require specific roles"""
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user
    return role_dependency


# Specific role dependencies
def require_administrator(current_user: User = Depends(get_current_user)) -> User:
    """Require administrator role"""
    if not current_user.is_administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    return current_user


def require_admin_or_operator(current_user: User = Depends(get_current_user)) -> User:
    """Require administrator or operator role"""
    if not (current_user.is_administrator or current_user.is_operator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or Operator access required"
        )
    return current_user


def require_any_authenticated(current_user: User = Depends(get_current_user)) -> User:
    """Require any authenticated user"""
    return current_user


# Permission-based dependencies
def require_create_permission(current_user: User = Depends(get_current_user)) -> User:
    """Require create permission"""
    if not current_user.can_create():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Create permission required"
        )
    return current_user


def require_edit_permission(current_user: User = Depends(get_current_user)) -> User:
    """Require edit permission"""
    if not current_user.can_edit():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Edit permission required"
        )
    return current_user


def require_delete_permission(current_user: User = Depends(get_current_user)) -> User:
    """Require delete permission"""
    if not current_user.can_delete():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Delete permission required"
        )
    return current_user


def require_user_management_permission(current_user: User = Depends(get_current_user)) -> User:
    """Require user management permission"""
    if not current_user.can_manage_users():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User management permission required"
        )
    return current_user


# Location-based access control
def require_location_access(location_id: Optional[int] = None):
    """Dependency factory to check location-based access"""
    def location_dependency(current_user: User = Depends(get_current_user)) -> User:
        # Administrators can access all locations
        if current_user.is_administrator:
            return current_user
        
        # If location_id is provided and user has assigned location, check match
        if location_id and current_user.assigned_location_id:
            if current_user.assigned_location_id != location_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this location"
                )
        
        # Operators with no assigned location can access all (for now)
        # You might want to restrict this based on your business rules
        
        return current_user
    return location_dependency


# Resource ownership check
def check_resource_owner_or_admin(
    resource_user_id: int,
    current_user: User = Depends(get_current_user)
) -> User:
    """Check if user owns the resource or is admin"""
    if current_user.id != resource_user_id and not current_user.is_administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own resources."
        )
    return current_user


# Decorator for adding authentication to existing functions
def authenticate_required(allowed_roles: Optional[List[UserRole]] = None):
    """Decorator to add authentication requirement to functions"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # This would be used for non-FastAPI functions
            # Implementation depends on how you want to handle it
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Permission checking utilities
class PermissionChecker:
    """Utility class for checking permissions"""
    
    @staticmethod
    def can_access_camera(user: User, camera_location_id: Optional[int] = None) -> bool:
        """Check if user can access a specific camera"""
        if user.is_administrator:
            return True
        
        if user.is_operator:
            # If user has assigned location, check if camera is in that location
            if user.assigned_location_id and camera_location_id:
                return user.assigned_location_id == camera_location_id
            # If no assigned location, can access all (adjust based on business rules)
            return True
        
        # Viewers can view all cameras
        return user.is_viewer
    
    @staticmethod
    def can_modify_camera(user: User, camera_location_id: Optional[int] = None) -> bool:
        """Check if user can modify a specific camera"""
        if user.is_administrator:
            return True
        
        if user.is_operator:
            # Check location-based access for operators
            if user.assigned_location_id and camera_location_id:
                return user.assigned_location_id == camera_location_id
            # If no assigned location, can modify all
            return True
        
        return False  # Viewers cannot modify
    
    @staticmethod
    def can_delete_camera(user: User, camera_location_id: Optional[int] = None) -> bool:
        """Check if user can delete a specific camera"""
        # Only administrators can delete
        return user.is_administrator
    
    @staticmethod
    def filter_locations_by_access(user: User, location_ids: List[int]) -> List[int]:
        """Filter location IDs based on user access"""
        if user.is_administrator:
            return location_ids
        
        if user.is_operator and user.assigned_location_id:
            # Return only assigned location if it's in the list
            return [user.assigned_location_id] if user.assigned_location_id in location_ids else []
        
        # Operators without assigned location or viewers can see all
        return location_ids


# Error handlers for common permission errors
def permission_denied_error(detail: str = "Access denied"):
    """Create a standardized permission denied error"""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail
    )


def unauthorized_error(detail: str = "Authentication required"):
    """Create a standardized unauthorized error"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"}
    )