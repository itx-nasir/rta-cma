import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Camera, 
  Users, 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Eye,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Monitor
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout, isAdministrator } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case UserRole.ADMINISTRATOR:
        return <Shield className="role-icon admin" />;
      case UserRole.OPERATOR:
        return <Settings className="role-icon operator" />;
      case UserRole.VIEWER:
        return <Eye className="role-icon viewer" />;
      default:
        return <User className="role-icon" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case UserRole.ADMINISTRATOR:
        return 'Administrator';
      case UserRole.OPERATOR:
        return 'Operator';
      case UserRole.VIEWER:
        return 'Viewer';
      default:
        return role;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <Camera className="brand-icon" />
            <span className="brand-text">RTA Camera Management</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className={`header-nav ${showMobileMenu ? 'mobile-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <Camera />
            <span>Cameras</span>
          </Link>
          
          <Link 
            to="/locations" 
            className={`nav-link ${isActive('/locations') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <MapPin />
            <span>Locations</span>
          </Link>
          
          <Link 
            to="/nvrs" 
            className={`nav-link ${isActive('/nvrs') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <Monitor />
            <span>NVR Devices</span>
          </Link>
          
          {isAdministrator() && (
            <Link 
              to="/users" 
              className={`nav-link ${isActive('/users') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <Users />
              <span>Users</span>
            </Link>
          )}
        </nav>

        {/* User Menu */}
        <div className="header-user">
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
          >
            {showMobileMenu ? <X /> : <Menu />}
          </button>

          {/* User Profile Dropdown */}
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={toggleUserMenu}
            >
              <div className="user-avatar">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.full_name || 'User'}</span>
                <span className="user-role">
                  {getRoleIcon(user?.role)}
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <ChevronDown className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-avatar large">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user?.full_name}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-role-badge">
                      {getRoleIcon(user?.role)}
                      {getRoleLabel(user?.role)}
                    </div>
                  </div>
                </div>

                <div className="user-menu-divider" />

                <div className="user-menu-actions">
                  <button className="menu-action profile-action">
                    <User />
                    Profile Settings
                  </button>
                  
                  <button 
                    className="menu-action logout-action"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* User Menu Overlay */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;