from sqlalchemy import Column, Integer, String
from app.db.session import Base
from sqlalchemy.orm import relationship

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, nullable=False, unique=True)
    location_type = Column(String, nullable=True)  # Building, Room, Outdoor, etc.
    item_location = Column(String, nullable=True)  # e.g., "Entrance Gate 2"
    old_location = Column(String, nullable=True)
    
    # Relationship with cameras
    cameras = relationship("Camera", back_populates="location")
