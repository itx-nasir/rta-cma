from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.core.permissions import (
    get_current_user_optional, require_create_permission, 
    require_edit_permission, require_delete_permission
)
from app.models.user import User
from app.schemas.camera import CameraCreate, CameraRead, CameraPaginatedResponse
from app.services.camera_service import (
    create_camera, get_cameras, get_camera_by_id, get_cameras_with_filters,
    get_cameras_by_location, get_cameras_by_nvr, search_cameras
)
from app.core.pagination import PaginatedResponse, SortOrder

router = APIRouter()

@router.post("/", response_model=CameraRead)
def api_create_camera(
    camera: CameraCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_create_permission)
):
    return create_camera(db, camera)

@router.get("/", response_model=CameraPaginatedResponse)
def api_get_cameras(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search in camera name, serial, RTA tag, IP, model"),
    status: Optional[str] = Query(None, description="Filter by status (Active, Inactive, etc.)"),
    camera_status: Optional[str] = Query(None, description="Filter by camera status (Online, Offline, etc.)"),
    location_id: Optional[int] = Query(None, description="Filter by location ID"),
    nvr_id: Optional[int] = Query(None, description="Filter by NVR ID"),
    brand: Optional[str] = Query(None, description="Filter by camera brand"),
    sort_by: Optional[str] = Query(None, description="Sort by field (id, camera_name, serial_no, status, etc.)"),
    sort_order: SortOrder = Query(SortOrder.asc, description="Sort order"),
    include_relations: bool = Query(False, description="Include location and NVR details"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get cameras with advanced filtering, search, and pagination
    
    - **search**: Search across camera name, serial number, RTA tag, IP address, and model
    - **status**: Filter by camera status (Active, Inactive, etc.)
    - **camera_status**: Filter by camera operational status (Online, Offline, etc.)
    - **location_id**: Filter cameras by specific location
    - **nvr_id**: Filter cameras by specific NVR device
    - **brand**: Filter by camera brand
    - **sort_by**: Sort results by specified field
    - **sort_order**: Ascending or descending order
    - **include_relations**: Include related location and NVR data
    """
    cameras, total = get_cameras_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        camera_status=camera_status,
        location_id=location_id,
        nvr_id=nvr_id,
        brand=brand,
        sort_by=sort_by,
        sort_order=sort_order,
        include_relations=include_relations
    )
    
    return PaginatedResponse.create(
        items=cameras,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{camera_id}", response_model=CameraRead)
def api_get_camera(
    camera_id: int, 
    include_relations: bool = Query(False, description="Include location and NVR details"),
    db: Session = Depends(get_db)
):
    """Get a specific camera by ID"""
    db_camera = get_camera_by_id(db, camera_id, include_relations=include_relations)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return db_camera

@router.get("/location/{location_id}", response_model=CameraPaginatedResponse)
def api_get_cameras_by_location(
    location_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all cameras in a specific location"""
    cameras, total = get_cameras_by_location(db, location_id, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=cameras,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/nvr/{nvr_id}", response_model=CameraPaginatedResponse)
def api_get_cameras_by_nvr(
    nvr_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all cameras connected to a specific NVR"""
    cameras, total = get_cameras_by_nvr(db, nvr_id, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=cameras,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/search/{search_term}", response_model=CameraPaginatedResponse)
def api_search_cameras(
    search_term: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search cameras by name, serial, RTA tag, IP, or model"""
    cameras, total = search_cameras(db, search_term, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=cameras,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{camera_id}", response_model=CameraRead)
def api_update_camera(
    camera_id: int,
    camera_update: CameraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_edit_permission)
):
    """Update a camera"""
    from app.services.camera_service import update_camera
    db_camera = update_camera(db, camera_id, camera_update)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return db_camera

@router.delete("/{camera_id}")
def api_delete_camera(
    camera_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_delete_permission)
):
    """Delete a camera"""
    from app.services.camera_service import delete_camera
    success = delete_camera(db, camera_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"message": "Camera deleted successfully"}
