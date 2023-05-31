import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Monitor, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid,
  List,
  Eye,
  Activity,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { cameraService } from '../services/api';
import CameraForm from './CameraForm';
import '../styles/CameraDashboard.css';

const CameraDashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cameraStatusFilter, setCameraStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [nvrFilter, setNvrFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    cameraStatuses: [],
    locations: [],
    nvrs: [],
    brands: []
  });

  // CRUD state
  const [showCameraForm, setShowCameraForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCamera, setDeletingCamera] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  const fetchCameras = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        sort_by: sortField,
        sort_order: sortOrder,
        include_relations: true
      };

      // Add filters
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (cameraStatusFilter) params.camera_status = cameraStatusFilter;
      if (locationFilter) params.location_id = locationFilter;
      if (nvrFilter) params.nvr_id = nvrFilter;
      if (brandFilter) params.brand = brandFilter;

      const response = await cameraService.getCameras(params);
      setCameras(response.items || []);
      setTotalItems(response.total || 0);
      
      // Extract filter options from data
      if (response.items) {
        const statuses = [...new Set(response.items.map(c => c.status).filter(Boolean))];
        const cameraStatuses = [...new Set(response.items.map(c => c.camera_status).filter(Boolean))];
        const locations = [...new Set(response.items.map(c => c.location?.location_name).filter(Boolean))];
        const nvrs = [...new Set(response.items.map(c => c.nvr?.nvr_name).filter(Boolean))];
        const brands = [...new Set(response.items.map(c => c.brand).filter(Boolean))];
        
        setFilterOptions({
          statuses,
          cameraStatuses,
          locations,
          nvrs,
          brands
        });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch cameras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, cameraStatusFilter, locationFilter, nvrFilter, brandFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCameras();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchCameras]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCameraStatusFilter('');
    setLocationFilter('');
    setNvrFilter('');
    setBrandFilter('');
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleCreateCamera = () => {
    setEditingCamera(null);
    setShowCameraForm(true);
  };

  const handleEditCamera = (camera) => {
    setEditingCamera(camera);
    setShowCameraForm(true);
    setShowActionsMenu(null);
  };

  const handleDeleteCamera = (camera) => {
    setDeletingCamera(camera);
    setShowDeleteDialog(true);
    setShowActionsMenu(null);
  };

  const handleCameraSaved = (savedCamera) => {
    setShowCameraForm(false);
    setEditingCamera(null);
    fetchCameras(); // Refresh the list
  };

  const handleCancelForm = () => {
    setShowCameraForm(false);
    setEditingCamera(null);
  };

  const confirmDelete = async () => {
    if (!deletingCamera) return;
    
    try {
      await cameraService.deleteCamera(deletingCamera.id);
      setShowDeleteDialog(false);
      setDeletingCamera(null);
      fetchCameras(); // Refresh the list
    } catch (err) {
      console.error('Error deleting camera:', err);
      // You might want to show an error message here
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingCamera(null);
  };

  const toggleActionsMenu = (cameraId) => {
    setShowActionsMenu(showActionsMenu === cameraId ? null : cameraId);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return <CheckCircle className="status-icon active" />;
      case 'inactive':
      case 'offline':
        return <XCircle className="status-icon inactive" />;
      default:
        return <AlertCircle className="status-icon warning" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return 'status-active';
      case 'inactive':
      case 'offline':
        return 'status-inactive';
      default:
        return 'status-warning';
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUp className="sort-icon inactive" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="sort-icon active" /> : 
      <ChevronDown className="sort-icon active" />;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && cameras.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <RefreshCw className="animate-spin" />
          <p>Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <Camera className="dashboard-icon" />
          <div>
            <h1>Camera Dashboard</h1>
            <p>Monitor and manage all cameras in the system</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={handleCreateCamera}
            className="create-button"
          >
            <Plus />
            Add Camera
          </button>
          <button 
            onClick={fetchCameras} 
            className={`refresh-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Total Cameras</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">
            {cameras.filter(c => c.status?.toLowerCase() === 'active').length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card online">
          <div className="stat-value">
            {cameras.filter(c => c.camera_status?.toLowerCase() === 'online').length}
          </div>
          <div className="stat-label">Online</div>
        </div>
        <div className="stat-card offline">
          <div className="stat-value">
            {cameras.filter(c => c.camera_status?.toLowerCase() === 'offline').length}
          </div>
          <div className="stat-label">Offline</div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-section">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search cameras by name, serial, IP, or model..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={cameraStatusFilter}
              onChange={(e) => { setCameraStatusFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="">All Connections</option>
              {filterOptions.cameraStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="">All Brands</option>
              {filterOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {(searchTerm || statusFilter || cameraStatusFilter || locationFilter || brandFilter) && (
              <button onClick={clearFilters} className="clear-filters">
                Clear All
              </button>
            )}
          </div>

          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
            >
              <List />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      {cameras.length === 0 && !loading ? (
        <div className="no-cameras">
          <Eye />
          <h3>No Cameras Found</h3>
          <p>No cameras match your current filters.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="cameras-grid">
              {cameras.map((camera) => (
                <Link key={camera.id} to={`/camera/${camera.id}`} className="camera-card-link">
                  <div className="camera-card">
                    <div className="camera-card-header">
                      <div className="camera-info">
                        <Camera className="camera-icon" />
                        <div>
                          <h3>{camera.camera_name || `Camera ${camera.id}`}</h3>
                          <p className="camera-serial">{camera.serial_no}</p>
                        </div>
                      </div>
                      <div className="camera-status-indicators">
                        <div className={`status-indicator ${getStatusClass(camera.status)}`}>
                          {getStatusIcon(camera.status)}
                        </div>
                        <div className={`connection-indicator ${getStatusClass(camera.camera_status)}`}>
                          {camera.camera_status?.toLowerCase() === 'online' ? 
                            <Wifi className="connection-icon" /> : 
                            <WifiOff className="connection-icon" />
                          }
                        </div>
                      </div>
                    </div>

                    <div className="camera-card-body">
                      <div className="camera-detail">
                        <MapPin className="detail-icon" />
                        <span>{camera.location?.location_name || 'No location'}</span>
                      </div>
                      <div className="camera-detail">
                        <Monitor className="detail-icon" />
                        <span>{camera.nvr?.nvr_name || 'No NVR'}</span>
                      </div>
                      <div className="camera-detail">
                        <Activity className="detail-icon" />
                        <span>{camera.ip_address || 'No IP'}</span>
                      </div>
                    </div>

                    <div className="camera-card-footer">
                      <div className="camera-tags">
                        {camera.brand && (
                          <span className="tag brand-tag">{camera.brand}</span>
                        )}
                        {camera.rta_tag && (
                          <span className="tag rta-tag">{camera.rta_tag}</span>
                        )}
                      </div>
                      <div className="card-actions">
                        <div className="view-details">
                          <Eye className="view-icon" />
                          View Details
                        </div>
                        <div className="camera-actions-menu">
                          <button 
                            className="actions-menu-button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleActionsMenu(camera.id);
                            }}
                          >
                            <MoreVertical />
                          </button>
                          {showActionsMenu === camera.id && (
                            <div className="actions-dropdown">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditCamera(camera);
                                }}
                                className="action-item edit-action"
                              >
                                <Edit />
                                Edit
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteCamera(camera);
                                }}
                                className="action-item delete-action"
                              >
                                <Trash2 />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cameras-table-wrapper">
              <table className="cameras-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('camera_name')} className="sortable">
                      Camera Name
                      {getSortIcon('camera_name')}
                    </th>
                    <th onClick={() => handleSort('serial_no')} className="sortable">
                      Serial No.
                      {getSortIcon('serial_no')}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status
                      {getSortIcon('status')}
                    </th>
                    <th onClick={() => handleSort('camera_status')} className="sortable">
                      Connection
                      {getSortIcon('camera_status')}
                    </th>
                    <th>Location</th>
                    <th>NVR</th>
                    <th onClick={() => handleSort('ip_address')} className="sortable">
                      IP Address
                      {getSortIcon('ip_address')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.map((camera) => (
                    <tr key={camera.id}>
                      <td className="camera-name-cell">
                        <div className="camera-name-wrapper">
                          <Camera className="table-camera-icon" />
                          <div>
                            <div className="camera-name">
                              {camera.camera_name || `Camera ${camera.id}`}
                            </div>
                            {camera.rta_tag && (
                              <div className="rta-tag-small">{camera.rta_tag}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{camera.serial_no}</td>
                      <td>
                        <div className={`status-badge ${getStatusClass(camera.status)}`}>
                          {getStatusIcon(camera.status)}
                          {camera.status || 'Unknown'}
                        </div>
                      </td>
                      <td>
                        <div className={`status-badge ${getStatusClass(camera.camera_status)}`}>
                          {camera.camera_status?.toLowerCase() === 'online' ? 
                            <Wifi className="connection-icon-small" /> : 
                            <WifiOff className="connection-icon-small" />
                          }
                          {camera.camera_status || 'Unknown'}
                        </div>
                      </td>
                      <td>
                        {camera.location ? (
                          <div className="location-info">
                            <MapPin className="location-icon-small" />
                            {camera.location.location_name}
                          </div>
                        ) : (
                          <span className="no-data">—</span>
                        )}
                      </td>
                      <td>
                        {camera.nvr ? (
                          <div className="nvr-info">
                            <Monitor className="nvr-icon-small" />
                            {camera.nvr.nvr_name}
                          </div>
                        ) : (
                          <span className="no-data">—</span>
                        )}
                      </td>
                      <td>{camera.ip_address || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/camera/${camera.id}`} className="view-details-button">
                            <Eye className="view-icon" />
                            View
                          </Link>
                          <button 
                            onClick={() => handleEditCamera(camera)}
                            className="edit-button"
                          >
                            <Edit />
                          </button>
                          <button 
                            onClick={() => handleDeleteCamera(camera)}
                            className="delete-button"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination">
            <div className="pagination-info">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} cameras
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-per-page"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
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

      {/* Camera Form Modal */}
      <CameraForm
        camera={editingCamera}
        isOpen={showCameraForm}
        onSave={handleCameraSaved}
        onCancel={handleCancelForm}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingCamera && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog">
            <div className="delete-dialog-header">
              <AlertCircle className="warning-icon" />
              <h3>Delete Camera</h3>
            </div>
            <div className="delete-dialog-content">
              <p>
                Are you sure you want to delete camera <strong>{deletingCamera.camera_name || deletingCamera.serial_no}</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="delete-dialog-actions">
              <button onClick={cancelDelete} className="cancel-delete-button">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-delete-button">
                <Trash2 />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraDashboard;