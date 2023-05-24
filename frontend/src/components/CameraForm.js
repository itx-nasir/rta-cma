import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Monitor, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { cameraService, locationService, nvrService } from '../services/api';
import '../styles/CameraForm.css';

const CameraForm = ({ camera = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    camera_name: '',
    serial_no: '',
    rta_tag: '',
    brand: '',
    model_no: '',
    ip_address: '',
    mac_address: '',
    protocol: 'IP',
    status: 'Active',
    camera_status: 'Online',
    location_id: null,
    nvr_id: null,
    sd_card: false,
    sd_capacity: null,
    is_asset: true,
    firmware_version: '',
    details: '',
    comments: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [locations, setLocations] = useState([]);
  const [nvrs, setNvrs] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load locations and NVRs for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [locationsResponse, nvrsResponse] = await Promise.all([
          locationService.getLocations({ limit: 1000 }),
          nvrService.getNvrs({ limit: 1000 })
        ]);
        setLocations(locationsResponse.items || []);
        setNvrs(nvrsResponse.items || []);
      } catch (err) {
        console.error('Error loading form options:', err);
        setError('Failed to load form options');
      } finally {
        setLoadingOptions(false);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  // Populate form when editing existing camera
  useEffect(() => {
    if (camera && isOpen) {
      setFormData({
        camera_name: camera.camera_name || '',
        serial_no: camera.serial_no || '',
        rta_tag: camera.rta_tag || '',
        brand: camera.brand || '',
        model_no: camera.model_no || '',
        ip_address: camera.ip_address || '',
        mac_address: camera.mac_address || '',
        protocol: camera.protocol || 'IP',
        status: camera.status || 'Active',
        camera_status: camera.camera_status || 'Online',
        location_id: camera.location_id || null,
        nvr_id: camera.nvr_id || null,
        sd_card: camera.sd_card || false,
        sd_capacity: camera.sd_capacity || null,
        is_asset: camera.is_asset !== undefined ? camera.is_asset : true,
        firmware_version: camera.firmware_version || '',
        details: camera.details || '',
        comments: camera.comments || ''
      });
    } else if (isOpen) {
      // Reset form for new camera
      setFormData({
        camera_name: '',
        serial_no: '',
        rta_tag: '',
        brand: '',
        model_no: '',
        ip_address: '',
        mac_address: '',
        protocol: 'IP',
        status: 'Active',
        camera_status: 'Online',
        location_id: null,
        nvr_id: null,
        sd_card: false,
        sd_capacity: null,
        is_asset: true,
        firmware_version: '',
        details: '',
        comments: ''
      });
    }
    setError(null);
    setSuccess(false);
  }, [camera, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : (isNaN(value) ? value : parseInt(value))
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.serial_no.trim()) {
      errors.push('Serial number is required');
    }
    
    if (formData.ip_address && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip_address)) {
      errors.push('Invalid IP address format');
    }
    
    if (formData.sd_card && formData.sd_capacity && formData.sd_capacity <= 0) {
      errors.push('SD card capacity must be greater than 0');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const submitData = { ...formData };
      
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      // Convert numeric strings to numbers
      if (submitData.sd_capacity) {
        submitData.sd_capacity = parseInt(submitData.sd_capacity);
      }

      let result;
      if (camera) {
        // Update existing camera
        result = await cameraService.updateCamera(camera.id, submitData);
      } else {
        // Create new camera
        result = await cameraService.createCamera(submitData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSave(result);
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save camera');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="camera-form-overlay">
      <div className="camera-form-modal">
        <div className="form-header">
          <div className="form-title">
            <Camera className="form-icon" />
            <h2>{camera ? 'Edit Camera' : 'Add New Camera'}</h2>
          </div>
          <button onClick={onCancel} className="close-button">
            <X />
          </button>
        </div>

        {loadingOptions ? (
          <div className="loading-form">
            <Loader className="animate-spin" />
            <p>Loading form options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="camera-form">
            {error && (
              <div className="form-error">
                <AlertCircle />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="form-success">
                <CheckCircle />
                <span>Camera {camera ? 'updated' : 'created'} successfully!</span>
              </div>
            )}

            <div className="form-sections">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="camera_name">Camera Name</label>
                    <input
                      type="text"
                      id="camera_name"
                      name="camera_name"
                      value={formData.camera_name}
                      onChange={handleInputChange}
                      placeholder="Enter camera name"
                    />
                  </div>

                  <div className="form-group required">
                    <label htmlFor="serial_no">Serial Number *</label>
                    <input
                      type="text"
                      id="serial_no"
                      name="serial_no"
                      value={formData.serial_no}
                      onChange={handleInputChange}
                      placeholder="Enter serial number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rta_tag">RTA Tag</label>
                    <input
                      type="text"
                      id="rta_tag"
                      name="rta_tag"
                      value={formData.rta_tag}
                      onChange={handleInputChange}
                      placeholder="Enter RTA tag"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Hikvision, Dahua"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="model_no">Model Number</label>
                    <input
                      type="text"
                      id="model_no"
                      name="model_no"
                      value={formData.model_no}
                      onChange={handleInputChange}
                      placeholder="Enter model number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="firmware_version">Firmware Version</label>
                    <input
                      type="text"
                      id="firmware_version"
                      name="firmware_version"
                      value={formData.firmware_version}
                      onChange={handleInputChange}
                      placeholder="Enter firmware version"
                    />
                  </div>
                </div>
              </div>

              {/* Network Configuration */}
              <div className="form-section">
                <h3>Network Configuration</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="ip_address">IP Address</label>
                    <input
                      type="text"
                      id="ip_address"
                      name="ip_address"
                      value={formData.ip_address}
                      onChange={handleInputChange}
                      placeholder="192.168.1.100"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mac_address">MAC Address</label>
                    <input
                      type="text"
                      id="mac_address"
                      name="mac_address"
                      value={formData.mac_address}
                      onChange={handleInputChange}
                      placeholder="00:11:22:33:44:55"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="protocol">Protocol</label>
                    <select
                      id="protocol"
                      name="protocol"
                      value={formData.protocol}
                      onChange={handleInputChange}
                    >
                      <option value="IP">IP</option>
                      <option value="Analog">Analog</option>
                      <option value="HD-TVI">HD-TVI</option>
                      <option value="HD-CVI">HD-CVI</option>
                      <option value="AHD">AHD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status and Assignment */}
              <div className="form-section">
                <h3>Status and Assignment</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="camera_status">Connection Status</label>
                    <select
                      id="camera_status"
                      name="camera_status"
                      value={formData.camera_status}
                      onChange={handleInputChange}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location_id">
                      <MapPin className="form-label-icon" />
                      Location
                    </label>
                    <select
                      id="location_id"
                      value={formData.location_id || ''}
                      onChange={(e) => handleSelectChange('location_id', e.target.value)}
                    >
                      <option value="">No location assigned</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="nvr_id">
                      <Monitor className="form-label-icon" />
                      NVR Device
                    </label>
                    <select
                      id="nvr_id"
                      value={formData.nvr_id || ''}
                      onChange={(e) => handleSelectChange('nvr_id', e.target.value)}
                    >
                      <option value="">No NVR assigned</option>
                      {nvrs.map(nvr => (
                        <option key={nvr.id} value={nvr.id}>
                          {nvr.nvr_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_asset"
                        checked={formData.is_asset}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-text">Active Asset</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Storage Configuration */}
              <div className="form-section">
                <h3>Storage Configuration</h3>
                <div className="form-grid">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sd_card"
                        checked={formData.sd_card}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-text">SD Card Installed</span>
                    </label>
                  </div>

                  {formData.sd_card && (
                    <div className="form-group">
                      <label htmlFor="sd_capacity">SD Card Capacity (GB)</label>
                      <input
                        type="number"
                        id="sd_capacity"
                        name="sd_capacity"
                        value={formData.sd_capacity || ''}
                        onChange={handleInputChange}
                        placeholder="32"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h3>Additional Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="details">Details</label>
                    <textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      placeholder="Additional camera details..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="comments">Comments</label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      placeholder="Comments or notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onCancel} className="cancel-button">
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button" 
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save />
                    {camera ? 'Update Camera' : 'Create Camera'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CameraForm;