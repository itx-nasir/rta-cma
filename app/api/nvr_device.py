from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.nvr_device import NVRDeviceCreate, NVRDeviceRead, NVRDevicePaginatedResponse
from app.services.nvr_service import (
    create_nvr, get_nvrs, get_nvr_by_id, get_nvrs_with_filters,
    search_nvrs, get_nvr_by_name, get_nvr_by_ip
)
from app.db.session import get_db
from app.core.pagination import PaginatedResponse, SortOrder

router = APIRouter()

@router.post("/", response_model=NVRDeviceRead)
def api_create_nvr(nvr: NVRDeviceCreate, db: Session = Depends(get_db)):
    return create_nvr(db, nvr)

@router.get("/", response_model=NVRDevicePaginatedResponse)
def api_get_nvrs(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search in NVR name, IP, channel, or switch port"),
    sort_by: Optional[str] = Query(None, description="Sort by field (id, nvr_name, ip_address, etc.)"),
    sort_order: SortOrder = Query(SortOrder.asc, description="Sort order"),
    include_cameras: bool = Query(False, description="Include camera details"),
    db: Session = Depends(get_db)
):
    """
    Get NVR devices with advanced filtering, search, and pagination
    
    - **search**: Search across NVR name, IP address, channel number, and switch port
    - **sort_by**: Sort results by specified field
    - **sort_order**: Ascending or descending order
    - **include_cameras**: Include related camera information
    """
    nvrs, total = get_nvrs_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        include_cameras=include_cameras
    )
    
    return PaginatedResponse.create(
        items=nvrs,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{nvr_id}", response_model=NVRDeviceRead)
def api_get_nvr(
    nvr_id: int,
    include_cameras: bool = Query(False, description="Include camera details"),
    db: Session = Depends(get_db)
):
    """Get a specific NVR device by ID"""
    db_nvr = get_nvr_by_id(db, nvr_id, include_cameras=include_cameras)
    if not db_nvr:
        raise HTTPException(status_code=404, detail="NVR device not found")
    return db_nvr

@router.get("/name/{nvr_name}", response_model=NVRDeviceRead)
def api_get_nvr_by_name(nvr_name: str, db: Session = Depends(get_db)):
    """Get NVR device by name"""
    db_nvr = get_nvr_by_name(db, nvr_name)
    if not db_nvr:
        raise HTTPException(status_code=404, detail="NVR device not found")
    return db_nvr

@router.get("/ip/{ip_address}", response_model=NVRDeviceRead)
def api_get_nvr_by_ip(ip_address: str, db: Session = Depends(get_db)):
    """Get NVR device by IP address"""
    db_nvr = get_nvr_by_ip(db, ip_address)
    if not db_nvr:
        raise HTTPException(status_code=404, detail="NVR device not found")
    return db_nvr

@router.get("/search/{search_term}", response_model=NVRDevicePaginatedResponse)
def api_search_nvrs(
    search_term: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search NVR devices by name, IP, channel, or switch port"""
    nvrs, total = search_nvrs(db, search_term, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=nvrs,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{nvr_id}", response_model=NVRDeviceRead)
def api_update_nvr(
    nvr_id: int,
    nvr_update: NVRDeviceCreate,
    db: Session = Depends(get_db)
):
    """Update an NVR device"""
    from app.services.nvr_service import update_nvr
    db_nvr = update_nvr(db, nvr_id, nvr_update)
    if not db_nvr:
        raise HTTPException(status_code=404, detail="NVR device not found")
    return db_nvr

@router.delete("/{nvr_id}")
def api_delete_nvr(nvr_id: int, db: Session = Depends(get_db)):
    """Delete an NVR device"""
    from app.services.nvr_service import delete_nvr
    success = delete_nvr(db, nvr_id)
    if not success:
        raise HTTPException(status_code=404, detail="NVR device not found")
    return {"message": "NVR device deleted successfully"}
