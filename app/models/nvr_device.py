from sqlalchemy import Column, Integer, String
from app.db.session import Base
from sqlalchemy.orm import relationship

class NVRDevice(Base):
    __tablename__ = "nvr_devices"

    id = Column(Integer, primary_key=True, index=True)
    nvr_name = Column(String, nullable=False, unique=True)  # DeepInMind or NVR name
    ip_address = Column(String, nullable=True)
    channel_number = Column(String, nullable=True)
    switch_port = Column(String, nullable=True)

    # Relationship
    cameras = relationship("Camera", back_populates="nvr")
