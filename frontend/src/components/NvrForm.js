import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader,
  Server,
  Globe
} from 'lucide-react';
import { nvrService } from '../services/api';
import '../styles/NvrForm.css';

const NvrForm = ({ nvr = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    nvr_name: '',
    ip_address: '',
    channel_number: '',
    switch_port: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Populate form when editing existing NVR
  useEffect(() => {
    if (nvr && isOpen) {
      setFormData({
        nvr_name: nvr.nvr_name || '',
        ip_address: nvr.ip_address || '',
        channel_number: nvr.channel_number || '',
        switch_port: nvr.switch_port || ''
      });
    } else if (isOpen) {
      // Reset form for new NVR
      setFormData({
        nvr_name: '',
        ip_address: '',
        channel_number: '',
        switch_port: ''
      });
    }
    setError(null);
    setSuccess(false);
  }, [nvr, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.nvr_name.trim()) {
      errors.push('NVR name is required');
    }
    
    if (formData.nvr_name.trim().length < 2) {
      errors.push('NVR name must be at least 2 characters long');
    }

    if (formData.ip_address && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip_address)) {
      errors.push('Invalid IP address format');
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

      let result;
      if (nvr) {
        // Update existing NVR
        result = await nvrService.updateNvr(nvr.id, submitData);
      } else {
        // Create new NVR
        result = await nvrService.createNvr(submitData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSave(result);
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save NVR device');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="nvr-form-overlay">
      <div className="nvr-form-modal">
        <div className="form-header">
          <div className="form-title">
            <Monitor className="form-icon" />
            <h2>{nvr ? 'Edit NVR Device' : 'Add New NVR Device'}</h2>
          </div>
          <button onClick={onCancel} className="close-button">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nvr-form">
          {error && (
            <div className="form-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-success">
              <CheckCircle />
              <span>NVR device {nvr ? 'updated' : 'created'} successfully!</span>
            </div>
          )}

          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>NVR Device Information</h3>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="nvr_name">NVR Name *</label>
                  <input
                    type="text"
                    id="nvr_name"
                    name="nvr_name"
                    value={formData.nvr_name}
                    onChange={handleInputChange}
                    placeholder="Enter NVR device name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ip_address">
                    <Globe className="form-label-icon" />
                    IP Address
                  </label>
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
                  <label htmlFor="channel_number">Channel Number</label>
                  <input
                    type="text"
                    id="channel_number"
                    name="channel_number"
                    value={formData.channel_number}
                    onChange={handleInputChange}
                    placeholder="Channel number or range"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="switch_port">
                    <Server className="form-label-icon" />
                    Switch Port
                  </label>
                  <input
                    type="text"
                    id="switch_port"
                    name="switch_port"
                    value={formData.switch_port}
                    onChange={handleInputChange}
                    placeholder="Switch port number"
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
                  {nvr ? 'Update NVR Device' : 'Create NVR Device'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NvrForm;