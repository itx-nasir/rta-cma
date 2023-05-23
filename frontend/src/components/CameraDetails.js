import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Monitor, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle,
  Info,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { cameraService, cameraActionService } from '../services/api';
import CameraActionsTable from './CameraActionsTable';
import CameraForm from './CameraForm';
import '../styles/CameraDetailsMain.css';

const CameraDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // CRUD state
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionFormData, setActionFormData] = useState({
    action_type: '',
    old_value: '',
    new_value: '',
    notes: ''
  });

  const fetchCameraData = useCallback(async () => {
    try {
      setRefreshing(true);
      const cameraData = await cameraService.getCameraById(id, true);
      setCamera(cameraData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch camera details');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCameraData();
  }, [fetchCameraData]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCameraData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCameraData]);

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

  // CRUD handlers
  const handleEditCamera = () => {
    setShowEditForm(true);
  };

  const handleDeleteCamera = () => {
    setShowDeleteDialog(true);
  };

  const handleCameraSaved = (updatedCamera) => {
    setCamera(updatedCamera);
    setShowEditForm(false);
    fetchCameraData(); // Refresh data
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  const confirmDelete = async () => {
    try {
      await cameraService.deleteCamera(id);
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      console.error('Error deleting camera:', err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleAddAction = () => {
    setActionFormData({
      action_type: '',
      old_value: '',
      new_value: '',
      notes: ''
    });
    setShowActionForm(true);
  };

  const handleActionFormChange = (e) => {
    const { name, value } = e.target;
    setActionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    try {
      const actionData = {
        ...actionFormData,
        camera_id: parseInt(id),
        action_date: new Date().toISOString()
      };
      
      await cameraActionService.createAction(actionData);
      setShowActionForm(false);
      // The CameraActionsTable component will refresh automatically
    } catch (err) {
      console.error('Error creating camera action:', err);
    }
  };

  const cancelActionForm = () => {
    setShowActionForm(false);
  };

  if (loading && !camera) {
    return (
      <div className="camera-details loading">
        <div className="loading-spinner">
          <RefreshCw className="animate-spin" />
          <p>Loading camera details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camera-details error">
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <h3>Error Loading Camera</h3>
          <p>{error}</p>
          <button onClick={fetchCameraData} className="retry-button">
            <RefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-details">
      <div className="camera-header">
        <div className="camera-title">
          <Camera className="camera-icon" />
          <div>
            <h1>{camera.camera_name || `Camera ${camera.id}`}</h1>
            <p className="camera-subtitle">{camera.serial_no}</p>
          </div>
        </div>
        <div className="camera-actions">
          <Link to="/" className="back-to-dashboard">
            ← Back to Dashboard
          </Link>
          <div className="action-buttons">
            <button 
              onClick={handleAddAction}
              className="add-action-button"
            >
              <Plus />
              Add Action
            </button>
            <button 
              onClick={handleEditCamera}
              className="edit-camera-button"
            >
              <Edit />
              Edit
            </button>
            <button 
              onClick={handleDeleteCamera}
              className="delete-camera-button"
            >
              <Trash2 />
              Delete
            </button>
            <button 
              onClick={fetchCameraData} 
              className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
              disabled={refreshing}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="camera-content">
        <div className="camera-cards">
          {/* Camera Information Card */}
          <div className="info-card camera-info-card">
            <div className="card-header">
              <Camera />
              <h2>Camera Information</h2>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{camera.camera_name || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Serial Number:</label>
                  <span>{camera.serial_no}</span>
                </div>
                <div className="info-item">
                  <label>RTA Tag:</label>
                  <span>{camera.rta_tag || 'Not assigned'}</span>
                </div>
                <div className="info-item">
                  <label>Brand:</label>
                  <span>{camera.brand || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>Model:</label>
                  <span>{camera.model_no || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>IP Address:</label>
                  <span>{camera.ip_address || 'Not configured'}</span>
                </div>
                <div className="info-item">
                  <label>MAC Address:</label>
                  <span>{camera.mac_address || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>Firmware:</label>
                  <span>{camera.firmware_version || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>Protocol:</label>
                  <span>{camera.protocol || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="info-card status-card">
            <div className="card-header">
              <div className="status-header">
                {camera.camera_status?.toLowerCase() === 'online' ? 
                  <Wifi className="status-wifi online" /> : 
                  <WifiOff className="status-wifi offline" />
                }
                <h2>Status</h2>
              </div>
            </div>
            <div className="card-content">
              <div className="status-items">
                <div className="status-item">
                  <label>Camera Status:</label>
                  <div className={`status-badge ${getStatusClass(camera.status)}`}>
                    {getStatusIcon(camera.status)}
                    {camera.status || 'Unknown'}
                  </div>
                </div>
                <div className="status-item">
                  <label>Connection:</label>
                  <div className={`status-badge ${getStatusClass(camera.camera_status)}`}>
                    {getStatusIcon(camera.camera_status)}
                    {camera.camera_status || 'Unknown'}
                  </div>
                </div>
                <div className="status-item">
                  <label>Asset Status:</label>
                  <div className={`status-badge ${camera.is_asset ? 'status-active' : 'status-inactive'}`}>
                    {camera.is_asset ? <CheckCircle /> : <XCircle />}
                    {camera.is_asset ? 'Active Asset' : 'Not an Asset'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="info-card location-card">
            <div className="card-header">
              <MapPin />
              <h2>Location</h2>
            </div>
            <div className="card-content">
              {camera.location ? (
                <div className="location-info">
                  <div className="info-item">
                    <label>Location Name:</label>
                    <span>{camera.location.location_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Type:</label>
                    <span>{camera.location.location_type || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Details:</label>
                    <span>{camera.location.item_location || 'Not specified'}</span>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <Info />
                  <p>No location assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* NVR Card */}
          <div className="info-card nvr-card">
            <div className="card-header">
              <Monitor />
              <h2>NVR Device</h2>
            </div>
            <div className="card-content">
              {camera.nvr ? (
                <div className="nvr-info">
                  <div className="info-item">
                    <label>NVR Name:</label>
                    <span>{camera.nvr.nvr_name}</span>
                  </div>
                  <div className="info-item">
                    <label>IP Address:</label>
                    <span>{camera.nvr.ip_address || 'Not configured'}</span>
                  </div>
                  <div className="info-item">
                    <label>Channel:</label>
                    <span>{camera.nvr.channel_number || 'Not assigned'}</span>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <Info />
                  <p>No NVR assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* SD Card Card */}
          <div className="info-card sd-card">
            <div className="card-header">
              <HardDrive />
              <h2>SD Card</h2>
            </div>
            <div className="card-content">
              {camera.sd_card ? (
                <div className="sd-info">
                  <div className="status-item">
                    <label>SD Card:</label>
                    <div className="status-badge status-active">
                      <CheckCircle />
                      Installed
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Capacity:</label>
                    <span>{camera.sd_capacity ? `${camera.sd_capacity} GB` : 'Unknown'}</span>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <XCircle className="no-sd-icon" />
                  <p>No SD card installed</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Card */}
          {(camera.details || camera.comments) && (
            <div className="info-card details-card full-width">
              <div className="card-header">
                <Info />
                <h2>Additional Details</h2>
              </div>
              <div className="card-content">
                {camera.details && (
                  <div className="detail-section">
                    <label>Details:</label>
                    <p>{camera.details}</p>
                  </div>
                )}
                {camera.comments && (
                  <div className="detail-section">
                    <label>Comments:</label>
                    <p>{camera.comments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Camera Actions Table */}
        <div className="actions-section">
          <CameraActionsTable cameraId={id} />
        </div>
      </div>

      {/* Edit Camera Form */}
      <CameraForm
        camera={camera}
        isOpen={showEditForm}
        onSave={handleCameraSaved}
        onCancel={handleCancelEdit}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog">
            <div className="delete-dialog-header">
              <AlertCircle className="warning-icon" />
              <h3>Delete Camera</h3>
            </div>
            <div className="delete-dialog-content">
              <p>
                Are you sure you want to delete camera <strong>{camera?.camera_name || camera?.serial_no}</strong>?
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

      {/* Add Action Form */}
      {showActionForm && (
        <div className="action-form-overlay">
          <div className="action-form-modal">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-icon" />
                <h3>Add Camera Action</h3>
              </div>
              <button onClick={cancelActionForm} className="close-button">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveAction} className="action-form">
              <div className="form-group">
                <label htmlFor="action_type">Action Type *</label>
                <select
                  id="action_type"
                  name="action_type"
                  value={actionFormData.action_type}
                  onChange={handleActionFormChange}
                  required
                >
                  <option value="">Select action type</option>
                  <option value="Status Change">Status Change</option>
                  <option value="Location Change">Location Change</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Configuration Change">Configuration Change</option>
                  <option value="Firmware Update">Firmware Update</option>
                  <option value="Hardware Issue">Hardware Issue</option>
                  <option value="Network Issue">Network Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="old_value">Old Value</label>
                <input
                  type="text"
                  id="old_value"
                  name="old_value"
                  value={actionFormData.old_value}
                  onChange={handleActionFormChange}
                  placeholder="Previous value or state"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_value">New Value</label>
                <input
                  type="text"
                  id="new_value"
                  name="new_value"
                  value={actionFormData.new_value}
                  onChange={handleActionFormChange}
                  placeholder="New value or state"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={actionFormData.notes}
                  onChange={handleActionFormChange}
                  placeholder="Additional details about this action..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelActionForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Plus />
                  Add Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraDetails;