import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Filter,
  RefreshCw,
  History,
  Eye,
  AlertCircle
} from 'lucide-react';
import { cameraActionService } from '../services/api';
import { format } from 'date-fns';
import '../styles/CameraActionsTableMain.css';

const CameraActionsTable = ({ cameraId }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Sorting state
  const [sortField, setSortField] = useState('action_date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Available action types for filter
  const [actionTypes, setActionTypes] = useState([]);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        sortOrder,
        includeCamera: true
      };

      // Add camera filter if provided
      if (cameraId) {
        params.camera_id = cameraId;
      }

      // Add search filter
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add action type filter
      if (actionTypeFilter) {
        params.action_type = actionTypeFilter;
      }

      // Add date range filter
      if (dateRange.start) {
        params.start_date = dateRange.start;
      }
      if (dateRange.end) {
        params.end_date = dateRange.end;
      }

      // Add sorting
      if (sortField) {
        params.sort_by = sortField;
      }

      const response = await cameraActionService.getAllActions(params);
      setActions(response.items || []);
      setTotalItems(response.total || 0);
      
      // Extract unique action types for filter dropdown
      const types = [...new Set(response.items.map(action => action.action_type))];
      setActionTypes(types);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch camera actions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cameraId, currentPage, itemsPerPage, searchTerm, actionTypeFilter, dateRange, sortField, sortOrder]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActions();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchActions]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActionTypeFilter = (e) => {
    setActionTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionTypeFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUp className="sort-icon inactive" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="sort-icon active" /> : 
      <ChevronDown className="sort-icon active" />;
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionTypeClass = (actionType) => {
    const type = actionType.toLowerCase();
    if (type.includes('status')) return 'action-status';
    if (type.includes('maintenance')) return 'action-maintenance';
    if (type.includes('location')) return 'action-location';
    if (type.includes('config')) return 'action-config';
    return 'action-default';
  };

  if (loading && actions.length === 0) {
    return (
      <div className="actions-table-container">
        <div className="actions-header">
          <div className="actions-title">
            <History />
            <h2>Camera Actions</h2>
          </div>
        </div>
        <div className="loading-state">
          <RefreshCw className="animate-spin" />
          <p>Loading camera actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="actions-table-container">
      <div className="actions-header">
        <div className="actions-title">
          <History />
          <h2>Camera Actions</h2>
          <span className="actions-count">({totalItems} total)</span>
        </div>
        <button 
          onClick={fetchActions} 
          className={`refresh-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="actions-filters">
        <div className="filter-group">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-select">
            <Filter className="filter-icon" />
            <select
              value={actionTypeFilter}
              onChange={handleActionTypeFilter}
              className="filter-dropdown"
            >
              <option value="">All Action Types</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>
                  {formatActionType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="date-filters">
            <div className="date-input-group">
              <Calendar className="date-icon" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="date-input"
                placeholder="Start Date"
              />
            </div>
            <div className="date-input-group">
              <Calendar className="date-icon" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="date-input"
                placeholder="End Date"
              />
            </div>
          </div>

          {(searchTerm || actionTypeFilter || dateRange.start || dateRange.end) && (
            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      {actions.length === 0 && !loading ? (
        <div className="no-data-state">
          <Eye />
          <h3>No Actions Found</h3>
          <p>No camera actions match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="actions-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('action_date')} className="sortable">
                    Date & Time
                    {getSortIcon('action_date')}
                  </th>
                  <th onClick={() => handleSort('action_type')} className="sortable">
                    Action Type
                    {getSortIcon('action_type')}
                  </th>
                  {!cameraId && (
                    <th onClick={() => handleSort('camera_id')} className="sortable">
                      Camera
                      {getSortIcon('camera_id')}
                    </th>
                  )}
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id}>
                    <td className="date-cell">
                      <div className="date-display">
                        <div className="date-main">
                          {format(new Date(action.action_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="time-sub">
                          {format(new Date(action.action_date), 'HH:mm:ss')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`action-type-badge ${getActionTypeClass(action.action_type)}`}>
                        {formatActionType(action.action_type)}
                      </span>
                    </td>
                    {!cameraId && (
                      <td className="camera-cell">
                        {action.camera ? (
                          <div className="camera-info">
                            <div className="camera-name">
                              {action.camera.camera_name || `Camera ${action.camera.id}`}
                            </div>
                            <div className="camera-serial">
                              {action.camera.serial_no}
                            </div>
                          </div>
                        ) : (
                          <span className="no-camera">Unknown Camera</span>
                        )}
                      </td>
                    )}
                    <td className="value-cell">
                      {action.old_value ? (
                        <span className="old-value">{action.old_value}</span>
                      ) : (
                        <span className="no-value">—</span>
                      )}
                    </td>
                    <td className="value-cell">
                      {action.new_value ? (
                        <span className="new-value">{action.new_value}</span>
                      ) : (
                        <span className="no-value">—</span>
                      )}
                    </td>
                    <td className="notes-cell">
                      {action.notes ? (
                        <span className="notes" title={action.notes}>
                          {action.notes.length > 50 ? 
                            `${action.notes.substring(0, 50)}...` : 
                            action.notes
                          }
                        </span>
                      ) : (
                        <span className="no-value">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-per-page"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft />
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <ChevronRight />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraActionsTable;