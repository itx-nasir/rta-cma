from pydantic import BaseModel
from typing import Optional, List
from app.core.pagination import PaginatedResponse

class LocationBase(BaseModel):
    location_name: str
    location_type: Optional[str] = None
    item_location: Optional[str] = None
    old_location: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class CameraSummary(BaseModel):
    """Summary camera information for location responses"""
    id: int
    camera_name: Optional[str] = None
    serial_no: str
    status: Optional[str] = None
    camera_status: Optional[str] = None
    
    class Config:
        from_attributes = True

class LocationRead(LocationBase):
    id: int
    cameras: Optional[List[CameraSummary]] = None

    class Config:
        from_attributes = True

# Type alias for location paginated response
LocationPaginatedResponse = PaginatedResponse[LocationRead]
