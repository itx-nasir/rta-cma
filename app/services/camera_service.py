from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional, Tuple, List
from datetime import datetime

from app.models.camera import Camera
from app.schemas.camera import CameraCreate
from app.core.filters import (
    apply_pagination, apply_search, apply_sorting, apply_filter_by_field,
    apply_status_filter, get_total_count
)
from app.core.pagination import SortOrder, PaginatedResponse


def create_camera(db: Session, camera: CameraCreate):
    db_camera = Camera(**camera.dict())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera


def get_cameras_with_filters(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    camera_status: Optional[str] = None,
    location_id: Optional[int] = None,
    nvr_id: Optional[int] = None,
    brand: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: SortOrder = SortOrder.asc,
    include_relations: bool = False
) -> Tuple[List[Camera], int]:
    """
    Get cameras with advanced filtering, search, and pagination
    """
    query = db.query(Camera)
    
    # Include related entities if requested
    if include_relations:
        query = query.options(joinedload(Camera.location), joinedload(Camera.nvr))
    
    # Apply search across multiple fields
    if search:
        search_fields = [
            Camera.camera_name,
            Camera.serial_no,
            Camera.rta_tag,
            Camera.ip_address,
            Camera.model_no
        ]
        query = apply_search(query, search, search_fields)
    
    # Apply filters
    query = apply_status_filter(query, Camera.status, status)
    query = apply_status_filter(query, Camera.camera_status, camera_status)
    query = apply_filter_by_field(query, Camera.location_id, location_id)
    query = apply_filter_by_field(query, Camera.nvr_id, nvr_id)
    query = apply_filter_by_field(query, Camera.brand, brand)
    
    # Define allowed sort fields
    allowed_sort_fields = {
        "id": Camera.id,
        "camera_name": Camera.camera_name,
        "serial_no": Camera.serial_no,
        "status": Camera.status,
        "camera_status": Camera.camera_status,
        "brand": Camera.brand,
        "ip_address": Camera.ip_address,
        "rta_tag": Camera.rta_tag
    }
    
    # Apply sorting
    query = apply_sorting(query, sort_by, sort_order, allowed_sort_fields)
    
    # Get total count before pagination
    total_count = get_total_count(query)
    
    # Apply pagination
    query = apply_pagination(query, skip, limit)
    
    cameras = query.all()
    return cameras, total_count


def get_cameras(db: Session, skip: int = 0, limit: int = 100):
    """Legacy method for backward compatibility"""
    cameras, _ = get_cameras_with_filters(db, skip=skip, limit=limit)
    return cameras


def get_camera_by_id(db: Session, camera_id: int, include_relations: bool = False):
    query = db.query(Camera)
    
    if include_relations:
        query = query.options(joinedload(Camera.location), joinedload(Camera.nvr))
    
    return query.filter(Camera.id == camera_id).first()


def get_cameras_by_location(db: Session, location_id: int, skip: int = 0, limit: int = 100):
    """Get cameras by location"""
    cameras, total = get_cameras_with_filters(
        db, skip=skip, limit=limit, location_id=location_id
    )
    return cameras, total


def get_cameras_by_nvr(db: Session, nvr_id: int, skip: int = 0, limit: int = 100):
    """Get cameras by NVR"""
    cameras, total = get_cameras_with_filters(
        db, skip=skip, limit=limit, nvr_id=nvr_id
    )
    return cameras, total


def search_cameras(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Search cameras by various fields"""
    cameras, total = get_cameras_with_filters(
        db, skip=skip, limit=limit, search=search_term
    )
    return cameras, total


def update_camera(db: Session, camera_id: int, camera_update: CameraCreate):
    """Update a camera"""
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if db_camera:
        update_data = camera_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_camera, field, value)
        db.commit()
        db.refresh(db_camera)
    return db_camera


def delete_camera(db: Session, camera_id: int):
    """Delete a camera"""
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if db_camera:
        db.delete(db_camera)
        db.commit()
        return True
    return False
