from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    serial_no = Column(String, unique=True, index=True, nullable=False)
    item_description = Column(String, nullable=True)
    model_no = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    rta_tag = Column(String, nullable=True)
    camera_name = Column(String, nullable=True)
    ip_address = Column(String, unique=True, nullable=True)
    mac_address = Column(String, unique=True, nullable=True)
    firmware_version = Column(String, nullable=True)
    protocol = Column(String, nullable=True)
    sd_card = Column(Boolean, default=False)
    sd_capacity = Column(Integer, nullable=True)
    status = Column(String, default="Inactive")
    camera_status = Column(String, default="Offline")
    details = Column(String, nullable=True)
    comments = Column(String, nullable=True)
    is_asset = Column(Boolean, default=True)

    # Foreign Key
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Relationship
    location = relationship("Location", back_populates="cameras")

        # Foreign Key
    nvr_id = Column(Integer, ForeignKey("nvr_devices.id"), nullable=True)

    # Relationship
    nvr = relationship("NVRDevice", back_populates="cameras")
    actions = relationship("CameraAction", back_populates="camera", cascade="all, delete-orphan")


