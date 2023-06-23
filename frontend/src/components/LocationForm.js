import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader,
  Building
} from 'lucide-react';
import { locationService } from '../services/api';
import '../styles/LocationForm.css';

const LocationForm = ({ location = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    location_name: '',
    location_type: '',
    item_location: '',
    old_location: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const locationTypes = [
    'Building',
    'Room', 
    'Outdoor',
    'Parking',
    'Entrance',
    'Hall',
    'Office',
    'Storage',
    'Corridor',
    'Lobby',
    'Stairway',
    'Elevator',
    'Other'
  ];

  // Populate form when editing existing location
  useEffect(() => {
    if (location && isOpen) {
      setFormData({
        location_name: location.location_name || '',
        location_type: location.location_type || '',
        item_location: location.item_location || '',
        old_location: location.old_location || ''
      });
    } else if (isOpen) {
      // Reset form for new location
      setFormData({
        location_name: '',
        location_type: '',
        item_location: '',
        old_location: ''
      });
    }
    setError(null);
    setSuccess(false);
  }, [location, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.location_name.trim()) {
      errors.push('Location name is required');
    }
    
    if (formData.location_name.trim().length < 2) {
      errors.push('Location name must be at least 2 characters long');
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
      if (location) {
        // Update existing location
        result = await locationService.updateLocation(location.id, submitData);
      } else {
        // Create new location
        result = await locationService.createLocation(submitData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSave(result);
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-form-overlay">
      <div className="location-form-modal">
        <div className="form-header">
          <div className="form-title">
            <MapPin className="form-icon" />
            <h2>{location ? 'Edit Location' : 'Add New Location'}</h2>
          </div>
          <button onClick={onCancel} className="close-button">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="location-form">
          {error && (
            <div className="form-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-success">
              <CheckCircle />
              <span>Location {location ? 'updated' : 'created'} successfully!</span>
            </div>
          )}

          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Location Information</h3>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="location_name">Location Name *</label>
                  <input
                    type="text"
                    id="location_name"
                    name="location_name"
                    value={formData.location_name}
                    onChange={handleInputChange}
                    placeholder="Enter location name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location_type">
                    <Building className="form-label-icon" />
                    Location Type
                  </label>
                  <select
                    id="location_type"
                    name="location_type"
                    value={formData.location_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select location type</option>
                    {locationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="item_location">Item Location</label>
                  <input
                    type="text"
                    id="item_location"
                    name="item_location"
                    value={formData.item_location}
                    onChange={handleInputChange}
                    placeholder="Specific item location or details"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="old_location">Previous Location</label>
                  <input
                    type="text"
                    id="old_location"
                    name="old_location"
                    value={formData.old_location}
                    onChange={handleInputChange}
                    placeholder="Previous or legacy location name"
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
                  {location ? 'Update Location' : 'Create Location'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;