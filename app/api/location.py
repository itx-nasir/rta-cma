from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.location import LocationCreate, LocationRead, LocationPaginatedResponse
from app.services.location_service import (
    create_location, get_locations, get_location_by_id, get_locations_with_filters,
    search_locations, get_locations_by_type
)
from app.db.session import get_db
from app.core.pagination import PaginatedResponse, SortOrder

router = APIRouter()

@router.post("/", response_model=LocationRead)
def api_create_location(location: LocationCreate, db: Session = Depends(get_db)):
    return create_location(db, location)

@router.get("/", response_model=LocationPaginatedResponse)
def api_get_locations(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search in location name, type, or details"),
    location_type: Optional[str] = Query(None, description="Filter by location type"),
    sort_by: Optional[str] = Query(None, description="Sort by field (id, location_name, location_type, etc.)"),
    sort_order: SortOrder = Query(SortOrder.asc, description="Sort order"),
    include_cameras: bool = Query(False, description="Include camera count and details"),
    db: Session = Depends(get_db)
):
    """
    Get locations with advanced filtering, search, and pagination
    
    - **search**: Search across location name, type, item location, and old location
    - **location_type**: Filter by location type (Building, Room, Outdoor, etc.)
    - **sort_by**: Sort results by specified field
    - **sort_order**: Ascending or descending order
    - **include_cameras**: Include related camera information
    """
    locations, total = get_locations_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        location_type=location_type,
        sort_by=sort_by,
        sort_order=sort_order,
        include_cameras=include_cameras
    )
    
    return PaginatedResponse.create(
        items=locations,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{location_id}", response_model=LocationRead)
def api_get_location(
    location_id: int,
    include_cameras: bool = Query(False, description="Include camera details"),
    db: Session = Depends(get_db)
):
    """Get a specific location by ID"""
    db_location = get_location_by_id(db, location_id, include_cameras=include_cameras)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.get("/type/{location_type}", response_model=LocationPaginatedResponse)
def api_get_locations_by_type(
    location_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all locations of a specific type"""
    locations, total = get_locations_by_type(db, location_type, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=locations,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/search/{search_term}", response_model=LocationPaginatedResponse)
def api_search_locations(
    search_term: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search locations by name, type, or details"""
    locations, total = search_locations(db, search_term, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=locations,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{location_id}", response_model=LocationRead)
def api_update_location(
    location_id: int,
    location_update: LocationCreate,
    db: Session = Depends(get_db)
):
    """Update a location"""
    from app.services.location_service import update_location
    db_location = update_location(db, location_id, location_update)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.delete("/{location_id}")
def api_delete_location(location_id: int, db: Session = Depends(get_db)):
    """Delete a location"""
    from app.services.location_service import delete_location
    success = delete_location(db, location_id)
    if not success:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}
