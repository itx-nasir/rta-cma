from pydantic import BaseModel
from typing import Optional, List
from app.core.pagination import PaginatedResponse

class NVRDeviceBase(BaseModel):
    nvr_name: str
    ip_address: Optional[str] = None
    channel_number: Optional[str] = None
    switch_port: Optional[str] = None

class NVRDeviceCreate(NVRDeviceBase):
    pass

class CameraSummary(BaseModel):
    """Summary camera information for NVR responses"""
    id: int
    camera_name: Optional[str] = None
    serial_no: str
    status: Optional[str] = None
    camera_status: Optional[str] = None
    ip_address: Optional[str] = None
    
    class Config:
        from_attributes = True

class NVRDeviceRead(NVRDeviceBase):
    id: int
    cameras: Optional[List[CameraSummary]] = None

    class Config:
        from_attributes = True

# Type alias for NVR device paginated response
NVRDevicePaginatedResponse = PaginatedResponse[NVRDeviceRead]
