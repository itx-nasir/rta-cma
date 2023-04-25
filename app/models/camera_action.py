from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CameraAction(Base):
    __tablename__ = "camera_actions"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    action_type = Column(String, nullable=False)  # e.g., "Status Change", "Maintenance", "Location Change"
    old_value = Column(String, nullable=True)     # previous value
    new_value = Column(String, nullable=True)     # new value
    notes = Column(String, nullable=True)         # extra info
    action_date = Column(DateTime, default=datetime.utcnow)

    # Relationship
    camera = relationship("Camera", back_populates="actions")
