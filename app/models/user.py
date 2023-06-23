from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum
from datetime import datetime


class UserRole(enum.Enum):
    ADMINISTRATOR = "administrator"
    OPERATOR = "operator" 
    VIEWER = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Optional: Location-based access for operators
    assigned_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    assigned_location = relationship("Location", foreign_keys=[assigned_location_id])

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.value}')>"

    @property
    def is_administrator(self) -> bool:
        return self.role == UserRole.ADMINISTRATOR
    
    @property 
    def is_operator(self) -> bool:
        return self.role == UserRole.OPERATOR
    
    @property
    def is_viewer(self) -> bool:
        return self.role == UserRole.VIEWER
    
    def can_create(self) -> bool:
        """Check if user can create new records"""
        return self.role in [UserRole.ADMINISTRATOR, UserRole.OPERATOR]
    
    def can_edit(self) -> bool:
        """Check if user can edit records"""
        return self.role in [UserRole.ADMINISTRATOR, UserRole.OPERATOR]
    
    def can_delete(self) -> bool:
        """Check if user can delete records"""
        return self.role == UserRole.ADMINISTRATOR
    
    def can_view(self) -> bool:
        """Check if user can view records"""
        return True  # All roles can view
    
    def can_manage_users(self) -> bool:
        """Check if user can manage other users"""
        return self.role == UserRole.ADMINISTRATOR