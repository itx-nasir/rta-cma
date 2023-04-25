from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional
from datetime import datetime
from enum import Enum

DataType = TypeVar('DataType')

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class PaginationParams(BaseModel):
    """Common pagination parameters"""
    skip: int = Field(default=0, ge=0, description="Number of items to skip")
    limit: int = Field(default=100, ge=1, le=1000, description="Number of items to return")

class SortParams(BaseModel):
    """Common sorting parameters"""
    sort_by: Optional[str] = Field(default=None, description="Field to sort by")
    sort_order: SortOrder = Field(default=SortOrder.asc, description="Sort order")

class DateRangeFilter(BaseModel):
    """Date range filtering parameters"""
    start_date: Optional[datetime] = Field(default=None, description="Start date for filtering")
    end_date: Optional[datetime] = Field(default=None, description="End date for filtering")

class SearchParams(BaseModel):
    """Common search parameters"""
    search: Optional[str] = Field(default=None, description="Search term")

class PaginatedResponse(BaseModel, Generic[DataType]):
    """Generic paginated response model"""
    items: List[DataType]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def create(cls, items: List[DataType], total: int, skip: int, limit: int):
        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=skip + len(items) < total
        )