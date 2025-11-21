import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth';
import { UserRole } from '../contexts/AuthContext';
import '../styles/UserForm.css';

const UserForm = ({ user, isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    role: UserRole.VIEWER,
    assigned_location_id: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        full_name: user.full_name || '',
        password: '', // Don't pre-fill password for editing
        role: user.role || UserRole.VIEWER,
        assigned_location_id: user.assigned_location_id || null
      });
    } else {
      setFormData({
        email: '',
        username: '',
        full_name: '',
        password: '',
        role: UserRole.VIEWER,
        assigned_location_id: null
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        const updateData = {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          assigned_location_id: formData.assigned_location_id,
          is_active: true
        };
        await authService.updateUser(user.id, updateData);
      } else {
        // Create new user
        await authService.register(formData);
      }
      
      onSave();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          (user ? 'Failed to update user' : 'Failed to create user');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-form-overlay">
      <div className="user-form-modal">
        <div className="user-form-header">
          <h2>{user ? 'Edit User' : 'Create New User'}</h2>
          <button 
            onClick={onCancel}
            className="close-button"
            type="button"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
                disabled={isSubmitting || !!user} // Disable username editing
              />
            </div>
            {user && (
              <small className="form-help">Username cannot be changed after creation</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {!user && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required={!user}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <small className="form-help">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <div className="input-wrapper">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value={UserRole.VIEWER}>Viewer</option>
                <option value={UserRole.OPERATOR}>Operator</option>
                <option value={UserRole.ADMINISTRATOR}>Administrator</option>
              </select>
            </div>
            <small className="form-help">
              Viewer: Read-only access | Operator: Can modify data | Administrator: Full access
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_location_id">Assigned Location (Optional)</label>
            <div className="input-wrapper">
              <input
                type="number"
                id="assigned_location_id"
                name="assigned_location_id"
                value={formData.assigned_location_id || ''}
                onChange={handleInputChange}
                placeholder="Enter location ID (optional)"
                disabled={isSubmitting}
              />
            </div>
            <small className="form-help">
              Leave empty for access to all locations
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;