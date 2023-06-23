import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Camera,
  Building,
  Filter,
  X
} from 'lucide-react';
import { locationService } from '../services/api';
import LocationForm from './LocationForm';
import { useAuth, UserRole } from '../contexts/AuthContext';
import '../styles/LocationManagement.css';

const LocationManagement = () => {
  const { hasAnyRole } = useAuth();
  const canEdit = hasAnyRole([UserRole.ADMINISTRATOR, UserRole.OPERATOR]);
  const canDelete = hasAnyRole([UserRole.ADMINISTRATOR]);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load locations
  const loadLocations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        include_cameras: true
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (locationTypeFilter) {
        params.location_type = locationTypeFilter;
      }

      const response = await locationService.getLocations(params);
      setLocations(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load locations');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, locationTypeFilter, itemsPerPage]);

  useEffect(() => {
    loadLocations(1);
  }, [searchTerm, locationTypeFilter, loadLocations]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationTypeFilter = (type) => {
    setLocationTypeFilter(type);
    setCurrentPage(1);
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (location) => {
    if (location.cameras && location.cameras.length > 0) {
      setError(`Cannot delete location "${location.location_name}" because it has ${location.cameras.length} camera(s) assigned to it. Please reassign the cameras first.`);
      return;
    }

    try {
      await locationService.deleteLocation(location.id);
      setSuccess(`Location "${location.location_name}" deleted successfully`);
      setDeleteConfirm(null);
      loadLocations(currentPage);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete location');
      console.error('Error deleting location:', err);
    }
  };

  const handleFormSave = (savedLocation) => {
    setShowForm(false);
    setEditingLocation(null);
    setSuccess(`Location "${savedLocation.location_name}" ${editingLocation ? 'updated' : 'created'} successfully`);
    loadLocations(currentPage);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationTypeFilter('');
    setShowFilters(false);
  };

  const locationTypes = ['Building', 'Room', 'Outdoor', 'Parking', 'Entrance', 'Hall', 'Office', 'Other'];

  return (
    <div className="location-management">
      <div className="management-header">
        <div className="header-title">
          <MapPin className="header-icon" />
          <div>
            <h1>Location Management</h1>
            <p>Manage physical locations and their assigned cameras</p>
          </div>
        </div>
        
        {canEdit && (
          <button onClick={handleAddLocation} className="add-button">
            <Plus />
            Add Location
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          <AlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-message">
            <X />
          </button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <CheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="close-message">
            <X />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search locations by name, type, or details..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-button ${showFilters ? 'active' : ''}`}
          >
            <Filter />
            Filters
          </button>
          
          {(searchTerm || locationTypeFilter) && (
            <button onClick={clearFilters} className="clear-filters">
              <X />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Location Type:</label>
            <div className="filter-chips">
              <button 
                className={`filter-chip ${locationTypeFilter === '' ? 'active' : ''}`}
                onClick={() => handleLocationTypeFilter('')}
              >
                All Types
              </button>
              {locationTypes.map(type => (
                <button 
                  key={type}
                  className={`filter-chip ${locationTypeFilter === type ? 'active' : ''}`}
                  onClick={() => handleLocationTypeFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {locations.length} of {totalItems} locations
          {searchTerm && ` matching "${searchTerm}"`}
          {locationTypeFilter && ` in ${locationTypeFilter}`}
        </p>
      </div>

      {/* Locations Table */}
      <div className="locations-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="empty-state">
            <MapPin className="empty-icon" />
            <h3>No locations found</h3>
            <p>
              {searchTerm || locationTypeFilter 
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by adding your first location'
              }
            </p>
            {canEdit && !searchTerm && !locationTypeFilter && (
              <button onClick={handleAddLocation} className="empty-action-button">
                <Plus />
                Add First Location
              </button>
            )}
          </div>
        ) : (
          <div className="locations-table">
            <table>
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Type</th>
                  <th>Item Location</th>
                  <th>Cameras</th>
                  <th>Old Location</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {locations.map(location => (
                  <tr key={location.id}>
                    <td>
                      <div className="location-name">
                        <Building className="location-icon" />
                        <div>
                          <div className="name">{location.location_name}</div>
                          <div className="id">ID: {location.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {location.location_type && (
                        <span className="location-type">
                          {location.location_type}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="item-location">
                        {location.item_location || 'Not specified'}
                      </span>
                    </td>
                    <td>
                      <div className="camera-count">
                        <Camera className="camera-icon" />
                        <span>{location.cameras ? location.cameras.length : 0}</span>
                      </div>
                    </td>
                    <td>
                      <span className="old-location">
                        {location.old_location || 'N/A'}
                      </span>
                    </td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div className="action-buttons">
                          {canEdit && (
                            <button 
                              onClick={() => handleEditLocation(location)}
                              className="action-button edit"
                              title="Edit location"
                            >
                              <Edit3 />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => setDeleteConfirm(location)}
                              className="action-button delete"
                              title="Delete location"
                            >
                              <Trash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => loadLocations(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button 
              onClick={() => loadLocations(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <AlertCircle className="warning-icon" />
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the location 
                <strong>"{deleteConfirm.location_name}"</strong>?
              </p>
              {deleteConfirm.cameras && deleteConfirm.cameras.length > 0 && (
                <div className="warning-message">
                  <AlertCircle />
                  <span>
                    This location has {deleteConfirm.cameras.length} camera(s) assigned. 
                    Please reassign them before deleting.
                  </span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteLocation(deleteConfirm)}
                className="delete-button"
                disabled={deleteConfirm.cameras && deleteConfirm.cameras.length > 0}
              >
                <Trash2 />
                Delete Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Form */}
      <LocationForm
        location={editingLocation}
        isOpen={showForm}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default LocationManagement;