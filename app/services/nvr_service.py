from sqlalchemy.orm import Session, joinedload
from typing import Optional, Tuple, List

from app.models.nvr_device import NVRDevice
from app.schemas.nvr_device import NVRDeviceCreate
from app.core.filters import (
    apply_pagination, apply_search, apply_sorting, get_total_count
)
from app.core.pagination import SortOrder


def create_nvr(db: Session, nvr: NVRDeviceCreate):
    db_nvr = NVRDevice(**nvr.dict())
    db.add(db_nvr)
    db.commit()
    db.refresh(db_nvr)
    return db_nvr


def get_nvrs_with_filters(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: SortOrder = SortOrder.asc,
    include_cameras: bool = False
) -> Tuple[List[NVRDevice], int]:
    """
    Get NVR devices with advanced filtering, search, and pagination
    """
    query = db.query(NVRDevice)
    
    # Include cameras if requested
    if include_cameras:
        query = query.options(joinedload(NVRDevice.cameras))
    
    # Apply search across multiple fields
    if search:
        search_fields = [
            NVRDevice.nvr_name,
            NVRDevice.ip_address,
            NVRDevice.channel_number,
            NVRDevice.switch_port
        ]
        query = apply_search(query, search, search_fields)
    
    # Define allowed sort fields
    allowed_sort_fields = {
        "id": NVRDevice.id,
        "nvr_name": NVRDevice.nvr_name,
        "ip_address": NVRDevice.ip_address,
        "channel_number": NVRDevice.channel_number,
        "switch_port": NVRDevice.switch_port
    }
    
    # Apply sorting
    query = apply_sorting(query, sort_by, sort_order, allowed_sort_fields)
    
    # Get total count before pagination
    total_count = get_total_count(query)
    
    # Apply pagination
    query = apply_pagination(query, skip, limit)
    
    nvrs = query.all()
    return nvrs, total_count


def get_nvrs(db: Session, skip: int = 0, limit: int = 100):
    """Legacy method for backward compatibility"""
    nvrs, _ = get_nvrs_with_filters(db, skip=skip, limit=limit)
    return nvrs


def get_nvr_by_id(db: Session, nvr_id: int, include_cameras: bool = False):
    query = db.query(NVRDevice)
    
    if include_cameras:
        query = query.options(joinedload(NVRDevice.cameras))
    
    return query.filter(NVRDevice.id == nvr_id).first()


def search_nvrs(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Search NVR devices by name, IP, channel, or switch port"""
    nvrs, total = get_nvrs_with_filters(
        db, skip=skip, limit=limit, search=search_term
    )
    return nvrs, total


def get_nvr_by_name(db: Session, nvr_name: str):
    """Get NVR by name"""
    return db.query(NVRDevice).filter(NVRDevice.nvr_name == nvr_name).first()


def get_nvr_by_ip(db: Session, ip_address: str):
    """Get NVR by IP address"""
    return db.query(NVRDevice).filter(NVRDevice.ip_address == ip_address).first()


def update_nvr(db: Session, nvr_id: int, nvr_update: NVRDeviceCreate):
    """Update an NVR device"""
    db_nvr = db.query(NVRDevice).filter(NVRDevice.id == nvr_id).first()
    if db_nvr:
        update_data = nvr_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_nvr, field, value)
        db.commit()
        db.refresh(db_nvr)
    return db_nvr


def delete_nvr(db: Session, nvr_id: int):
    """Delete an NVR device"""
    db_nvr = db.query(NVRDevice).filter(NVRDevice.id == nvr_id).first()
    if db_nvr:
        db.delete(db_nvr)
        db.commit()
        return True
    return False
