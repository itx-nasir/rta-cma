import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Camera,
  Server,
  X,
  Globe
} from 'lucide-react';
import { nvrService } from '../services/api';
import NvrForm from './NvrForm';
import { useAuth, UserRole } from '../contexts/AuthContext';
import '../styles/NvrManagement.css';

const NvrManagement = () => {
  const { hasAnyRole } = useAuth();
  const canEdit = hasAnyRole([UserRole.ADMINISTRATOR, UserRole.OPERATOR]);
  const canDelete = hasAnyRole([UserRole.ADMINISTRATOR]);

  const [nvrs, setNvrs] = useState([]);
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

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingNvr, setEditingNvr] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load NVRs
  const loadNvrs = useCallback(async (page = 1) => {
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

      const response = await nvrService.getNvrs(params);
      setNvrs(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load NVR devices');
      console.error('Error loading NVRs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    loadNvrs(1);
  }, [searchTerm, loadNvrs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddNvr = () => {
    setEditingNvr(null);
    setShowForm(true);
  };

  const handleEditNvr = (nvr) => {
    setEditingNvr(nvr);
    setShowForm(true);
  };

  const handleDeleteNvr = async (nvr) => {
    if (nvr.cameras && nvr.cameras.length > 0) {
      setError(`Cannot delete NVR "${nvr.nvr_name}" because it has ${nvr.cameras.length} camera(s) assigned to it. Please reassign the cameras first.`);
      return;
    }

    try {
      await nvrService.deleteNvr(nvr.id);
      setSuccess(`NVR "${nvr.nvr_name}" deleted successfully`);
      setDeleteConfirm(null);
      loadNvrs(currentPage);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete NVR device');
      console.error('Error deleting NVR:', err);
    }
  };

  const handleFormSave = (savedNvr) => {
    setShowForm(false);
    setEditingNvr(null);
    setSuccess(`NVR "${savedNvr.nvr_name}" ${editingNvr ? 'updated' : 'created'} successfully`);
    loadNvrs(currentPage);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingNvr(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <div className="nvr-management">
      <div className="management-header">
        <div className="header-title">
          <Monitor className="header-icon" />
          <div>
            <h1>NVR Device Management</h1>
            <p>Manage Network Video Recorders and their connected cameras</p>
          </div>
        </div>
        
        {canEdit && (
          <button onClick={handleAddNvr} className="add-button">
            <Plus />
            Add NVR Device
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
            placeholder="Search NVRs by name, IP address, channel, or switch port..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-actions">
          {searchTerm && (
            <button onClick={clearFilters} className="clear-filters">
              <X />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {nvrs.length} of {totalItems} NVR devices
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* NVRs Table */}
      <div className="nvrs-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading NVR devices...</p>
          </div>
        ) : nvrs.length === 0 ? (
          <div className="empty-state">
            <Monitor className="empty-icon" />
            <h3>No NVR devices found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first NVR device'
              }
            </p>
            {canEdit && !searchTerm && (
              <button onClick={handleAddNvr} className="empty-action-button">
                <Plus />
                Add First NVR Device
              </button>
            )}
          </div>
        ) : (
          <div className="nvrs-table">
            <table>
              <thead>
                <tr>
                  <th>NVR Name</th>
                  <th>IP Address</th>
                  <th>Channel Number</th>
                  <th>Switch Port</th>
                  <th>Connected Cameras</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {nvrs.map(nvr => (
                  <tr key={nvr.id}>
                    <td>
                      <div className="nvr-name">
                        <Server className="nvr-icon" />
                        <div>
                          <div className="name">{nvr.nvr_name}</div>
                          <div className="id">ID: {nvr.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ip-address">
                        {nvr.ip_address ? (
                          <>
                            <Globe className="ip-icon" />
                            <span>{nvr.ip_address}</span>
                          </>
                        ) : (
                          <span className="not-specified">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="channel-number">
                        {nvr.channel_number || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="switch-port">
                        {nvr.switch_port || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="camera-count">
                        <Camera className="camera-icon" />
                        <span>{nvr.cameras ? nvr.cameras.length : 0}</span>
                      </div>
                    </td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div className="action-buttons">
                          {canEdit && (
                            <button 
                              onClick={() => handleEditNvr(nvr)}
                              className="action-button edit"
                              title="Edit NVR device"
                            >
                              <Edit3 />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => setDeleteConfirm(nvr)}
                              className="action-button delete"
                              title="Delete NVR device"
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
              onClick={() => loadNvrs(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button 
              onClick={() => loadNvrs(currentPage + 1)}
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
                Are you sure you want to delete the NVR device 
                <strong>"{deleteConfirm.nvr_name}"</strong>?
              </p>
              {deleteConfirm.cameras && deleteConfirm.cameras.length > 0 && (
                <div className="warning-message">
                  <AlertCircle />
                  <span>
                    This NVR has {deleteConfirm.cameras.length} camera(s) assigned. 
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
                onClick={() => handleDeleteNvr(deleteConfirm)}
                className="delete-button"
                disabled={deleteConfirm.cameras && deleteConfirm.cameras.length > 0}
              >
                <Trash2 />
                Delete NVR Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NVR Form */}
      <NvrForm
        nvr={editingNvr}
        isOpen={showForm}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default NvrManagement;