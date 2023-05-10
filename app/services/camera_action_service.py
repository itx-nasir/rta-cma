from sqlalchemy.orm import Session, joinedload
from typing import Optional, Tuple, List
from datetime import datetime

from app.models.camera_action import CameraAction
from app.schemas.camera_action import CameraActionCreate
from app.core.filters import (
    apply_pagination, apply_search, apply_sorting, apply_filter_by_field,
    apply_date_range_filter, get_total_count
)
from app.core.pagination import SortOrder


def create_camera_action(db: Session, action: CameraActionCreate):
    db_action = CameraAction(**action.dict())
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action


def get_camera_actions_with_filters(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    camera_id: Optional[int] = None,
    action_type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = None,
    sort_order: SortOrder = SortOrder.desc,  # Default to newest first
    include_camera: bool = False
) -> Tuple[List[CameraAction], int]:
    """
    Get camera actions with advanced filtering, search, and pagination
    """
    query = db.query(CameraAction)
    
    # Include camera details if requested
    if include_camera:
        query = query.options(joinedload(CameraAction.camera))
    
    # Apply filters
    query = apply_filter_by_field(query, CameraAction.camera_id, camera_id)
    query = apply_filter_by_field(query, CameraAction.action_type, action_type)
    
    # Apply date range filter
    query = apply_date_range_filter(query, CameraAction.action_date, start_date, end_date)
    
    # Apply search across multiple fields
    if search:
        search_fields = [
            CameraAction.action_type,
            CameraAction.old_value,
            CameraAction.new_value,
            CameraAction.notes
        ]
        query = apply_search(query, search, search_fields)
    
    # Define allowed sort fields
    allowed_sort_fields = {
        "id": CameraAction.id,
        "action_date": CameraAction.action_date,
        "action_type": CameraAction.action_type,
        "camera_id": CameraAction.camera_id
    }
    
    # Apply sorting (default to newest first)
    if not sort_by:
        sort_by = "action_date"
        
    query = apply_sorting(query, sort_by, sort_order, allowed_sort_fields)
    
    # Get total count before pagination
    total_count = get_total_count(query)
    
    # Apply pagination
    query = apply_pagination(query, skip, limit)
    
    actions = query.all()
    return actions, total_count


def get_camera_actions(db: Session, camera_id: int):
    """Legacy method for backward compatibility"""
    actions, _ = get_camera_actions_with_filters(db, camera_id=camera_id, limit=1000)
    return actions


def get_action_by_id(db: Session, action_id: int, include_camera: bool = False):
    query = db.query(CameraAction)
    
    if include_camera:
        query = query.options(joinedload(CameraAction.camera))
    
    return query.filter(CameraAction.id == action_id).first()


def get_actions_by_type(db: Session, action_type: str, skip: int = 0, limit: int = 100):
    """Get actions by type"""
    actions, total = get_camera_actions_with_filters(
        db, skip=skip, limit=limit, action_type=action_type
    )
    return actions, total


def get_actions_by_date_range(
    db: Session, 
    start_date: datetime, 
    end_date: datetime, 
    skip: int = 0, 
    limit: int = 100
):
    """Get actions within a date range"""
    actions, total = get_camera_actions_with_filters(
        db, skip=skip, limit=limit, start_date=start_date, end_date=end_date
    )
    return actions, total


def search_actions(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Search actions by type, values, or notes"""
    actions, total = get_camera_actions_with_filters(
        db, skip=skip, limit=limit, search=search_term
    )
    return actions, total


def update_camera_action(db: Session, action_id: int, action_update: CameraActionCreate):
    """Update a camera action"""
    db_action = db.query(CameraAction).filter(CameraAction.id == action_id).first()
    if db_action:
        update_data = action_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_action, field, value)
        db.commit()
        db.refresh(db_action)
    return db_action


def delete_camera_action(db: Session, action_id: int):
    """Delete a camera action"""
    db_action = db.query(CameraAction).filter(CameraAction.id == action_id).first()
    if db_action:
        db.delete(db_action)
        db.commit()
        return True
    return False
