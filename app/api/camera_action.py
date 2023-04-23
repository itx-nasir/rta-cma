from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.schemas.camera_action import (
    CameraActionCreate, CameraActionRead, CameraActionPaginatedResponse
)
from app.services.camera_action_service import (
    create_camera_action, get_camera_actions, get_camera_actions_with_filters,
    get_action_by_id, get_actions_by_type, get_actions_by_date_range, search_actions
)
from app.db.session import get_db
from app.core.pagination import PaginatedResponse, SortOrder

router = APIRouter()

@router.post("/", response_model=CameraActionRead)
def api_create_action(action: CameraActionCreate, db: Session = Depends(get_db)):
    return create_camera_action(db, action)

@router.get("/", response_model=CameraActionPaginatedResponse)
def api_get_all_actions(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    camera_id: Optional[int] = Query(None, description="Filter by camera ID"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    search: Optional[str] = Query(None, description="Search in action type, values, or notes"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering (YYYY-MM-DD or ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering (YYYY-MM-DD or ISO format)"),
    sort_by: Optional[str] = Query(None, description="Sort by field (id, action_date, action_type, camera_id)"),
    sort_order: SortOrder = Query(SortOrder.desc, description="Sort order (newest first by default)"),
    include_camera: bool = Query(False, description="Include camera details"),
    db: Session = Depends(get_db)
):
    """
    Get camera actions with advanced filtering, search, and pagination
    
    - **camera_id**: Filter actions for a specific camera
    - **action_type**: Filter by action type (Status Change, Maintenance, Location Change, etc.)
    - **search**: Search across action type, old/new values, and notes
    - **start_date**: Filter actions from this date onwards
    - **end_date**: Filter actions up to this date
    - **sort_by**: Sort results by specified field
    - **sort_order**: Ascending or descending order (default: newest first)
    - **include_camera**: Include related camera information
    """
    actions, total = get_camera_actions_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        camera_id=camera_id,
        action_type=action_type,
        search=search,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order,
        include_camera=include_camera
    )
    
    return PaginatedResponse.create(
        items=actions,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{action_id}", response_model=CameraActionRead)
def api_get_action(
    action_id: int,
    include_camera: bool = Query(False, description="Include camera details"),
    db: Session = Depends(get_db)
):
    """Get a specific camera action by ID"""
    db_action = get_action_by_id(db, action_id, include_camera=include_camera)
    if not db_action:
        raise HTTPException(status_code=404, detail="Camera action not found")
    return db_action

@router.get("/camera/{camera_id}", response_model=CameraActionPaginatedResponse)
def api_get_actions_by_camera(
    camera_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    sort_order: SortOrder = Query(SortOrder.desc, description="Sort order"),
    db: Session = Depends(get_db)
):
    """Get all actions for a specific camera"""
    actions, total = get_camera_actions_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        camera_id=camera_id,
        action_type=action_type,
        start_date=start_date,
        end_date=end_date,
        sort_order=sort_order
    )
    
    return PaginatedResponse.create(
        items=actions,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/type/{action_type}", response_model=CameraActionPaginatedResponse)
def api_get_actions_by_type(
    action_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    camera_id: Optional[int] = Query(None, description="Filter by camera ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db)
):
    """Get all actions of a specific type"""
    actions, total = get_camera_actions_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        camera_id=camera_id,
        action_type=action_type,
        start_date=start_date,
        end_date=end_date
    )
    
    return PaginatedResponse.create(
        items=actions,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/search/{search_term}", response_model=CameraActionPaginatedResponse)
def api_search_actions(
    search_term: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    camera_id: Optional[int] = Query(None, description="Filter by camera ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db)
):
    """Search actions by type, values, or notes"""
    actions, total = get_camera_actions_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        camera_id=camera_id,
        search=search_term,
        start_date=start_date,
        end_date=end_date
    )
    
    return PaginatedResponse.create(
        items=actions,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{action_id}", response_model=CameraActionRead)
def api_update_action(
    action_id: int,
    action_update: CameraActionCreate,
    db: Session = Depends(get_db)
):
    """Update a camera action"""
    from app.services.camera_action_service import update_camera_action
    db_action = update_camera_action(db, action_id, action_update)
    if not db_action:
        raise HTTPException(status_code=404, detail="Camera action not found")
    return db_action

@router.delete("/{action_id}")
def api_delete_action(action_id: int, db: Session = Depends(get_db)):
    """Delete a camera action"""
    from app.services.camera_action_service import delete_camera_action
    success = delete_camera_action(db, action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera action not found")
    return {"message": "Camera action deleted successfully"}
