from pydantic import BaseModel
from typing import Optional
from app.core.pagination import PaginatedResponse

class CameraBase(BaseModel):
    serial_no: str
    item_description: Optional[str] = None
    model_no: Optional[str] = None
    brand: Optional[str] = None
    rta_tag: Optional[str] = None
    camera_name: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    firmware_version: Optional[str] = None
    protocol: Optional[str] = None
    sd_card: Optional[bool] = False
    sd_capacity: Optional[int] = None
    status: Optional[str] = "Inactive"
    camera_status: Optional[str] = "Offline"
    details: Optional[str] = None
    comments: Optional[str] = None
    is_asset: Optional[bool] = True
    location_id: Optional[int] = None
    nvr_id: Optional[int] = None

class CameraCreate(CameraBase):
    pass

class LocationInfo(BaseModel):
    """Nested location information"""
    id: int
    location_name: str
    location_type: Optional[str] = None
    item_location: Optional[str] = None
    
    class Config:
        from_attributes = True

class NVRInfo(BaseModel):
    """Nested NVR information"""
    id: int
    nvr_name: str
    ip_address: Optional[str] = None
    channel_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class CameraRead(CameraBase):
    id: int
    location: Optional[LocationInfo] = None
    nvr: Optional[NVRInfo] = None

    class Config:
        from_attributes = True

# Type alias for camera paginated response
CameraPaginatedResponse = PaginatedResponse[CameraRead]
