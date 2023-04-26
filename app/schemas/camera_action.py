from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.pagination import PaginatedResponse

class CameraActionBase(BaseModel):
    action_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    notes: Optional[str] = None

class CameraActionCreate(CameraActionBase):
    camera_id: int

class CameraInfo(BaseModel):
    """Camera information for action responses"""
    id: int
    camera_name: Optional[str] = None
    serial_no: str
    rta_tag: Optional[str] = None
    
    class Config:
        from_attributes = True

class CameraActionRead(CameraActionBase):
    id: int
    camera_id: int
    action_date: datetime
    camera: Optional[CameraInfo] = None

    class Config:
        from_attributes = True

# Type alias for camera action paginated response
CameraActionPaginatedResponse = PaginatedResponse[CameraActionRead]
