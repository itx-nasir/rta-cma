from sqlalchemy.orm import Session, joinedload
from typing import Optional, Tuple, List

from app.models.location import Location
from app.schemas.location import LocationCreate
from app.core.filters import (
    apply_pagination, apply_search, apply_sorting, apply_filter_by_field,
    get_total_count
)
from app.core.pagination import SortOrder


def create_location(db: Session, location: LocationCreate):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def get_locations_with_filters(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    location_type: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: SortOrder = SortOrder.asc,
    include_cameras: bool = False
) -> Tuple[List[Location], int]:
    """
    Get locations with advanced filtering, search, and pagination
    """
    query = db.query(Location)
    
    # Include cameras if requested
    if include_cameras:
        query = query.options(joinedload(Location.cameras))
    
    # Apply search across multiple fields
    if search:
        search_fields = [
            Location.location_name,
            Location.location_type,
            Location.item_location,
            Location.old_location
        ]
        query = apply_search(query, search, search_fields)
    
    # Apply filters
    query = apply_filter_by_field(query, Location.location_type, location_type)
    
    # Define allowed sort fields
    allowed_sort_fields = {
        "id": Location.id,
        "location_name": Location.location_name,
        "location_type": Location.location_type,
        "item_location": Location.item_location
    }
    
    # Apply sorting
    query = apply_sorting(query, sort_by, sort_order, allowed_sort_fields)
    
    # Get total count before pagination
    total_count = get_total_count(query)
    
    # Apply pagination
    query = apply_pagination(query, skip, limit)
    
    locations = query.all()
    return locations, total_count


def get_locations(db: Session, skip: int = 0, limit: int = 100):
    """Legacy method for backward compatibility"""
    locations, _ = get_locations_with_filters(db, skip=skip, limit=limit)
    return locations


def get_location_by_id(db: Session, location_id: int, include_cameras: bool = False):
    query = db.query(Location)
    
    if include_cameras:
        query = query.options(joinedload(Location.cameras))
    
    return query.filter(Location.id == location_id).first()


def search_locations(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Search locations by name, type, or location details"""
    locations, total = get_locations_with_filters(
        db, skip=skip, limit=limit, search=search_term
    )
    return locations, total


def get_locations_by_type(db: Session, location_type: str, skip: int = 0, limit: int = 100):
    """Get locations by type"""
    locations, total = get_locations_with_filters(
        db, skip=skip, limit=limit, location_type=location_type
    )
    return locations, total


def update_location(db: Session, location_id: int, location_update: LocationCreate):
    """Update a location"""
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location:
        update_data = location_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_location, field, value)
        db.commit()
        db.refresh(db_location)
    return db_location


def delete_location(db: Session, location_id: int):
    """Delete a location"""
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if db_location:
        db.delete(db_location)
        db.commit()
        return True
    return False
