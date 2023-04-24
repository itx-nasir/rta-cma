from sqlalchemy import and_, or_, desc, asc
from sqlalchemy.orm import Query
from typing import Optional, List, Any
from datetime import datetime
from app.core.pagination import SortOrder


def apply_pagination(query: Query, skip: int, limit: int) -> Query:
    """Apply pagination to a query"""
    return query.offset(skip).limit(limit)


def apply_search(query: Query, search_term: Optional[str], search_fields: List[str]) -> Query:
    """Apply search filtering to a query"""
    if not search_term or not search_fields:
        return query
    
    search_conditions = []
    for field in search_fields:
        # Use ilike for case-insensitive search
        search_conditions.append(field.ilike(f"%{search_term}%"))
    
    return query.filter(or_(*search_conditions))


def apply_date_range_filter(query: Query, date_field: Any, 
                           start_date: Optional[datetime], 
                           end_date: Optional[datetime]) -> Query:
    """Apply date range filtering to a query"""
    filters = []
    
    if start_date:
        filters.append(date_field >= start_date)
    
    if end_date:
        filters.append(date_field <= end_date)
    
    if filters:
        query = query.filter(and_(*filters))
    
    return query


def apply_sorting(query: Query, sort_by: Optional[str], sort_order: SortOrder, 
                 allowed_sort_fields: dict) -> Query:
    """Apply sorting to a query"""
    if not sort_by or sort_by not in allowed_sort_fields:
        return query
    
    sort_field = allowed_sort_fields[sort_by]
    
    if sort_order == SortOrder.desc:
        return query.order_by(desc(sort_field))
    else:
        return query.order_by(asc(sort_field))


def apply_filter_by_field(query: Query, field: Any, value: Optional[Any]) -> Query:
    """Apply simple field filtering to a query"""
    if value is not None:
        return query.filter(field == value)
    return query


def apply_status_filter(query: Query, status_field: Any, status: Optional[str]) -> Query:
    """Apply status filtering to a query"""
    return apply_filter_by_field(query, status_field, status)


def get_total_count(query: Query) -> int:
    """Get total count for a query (before pagination)"""
    return query.count()