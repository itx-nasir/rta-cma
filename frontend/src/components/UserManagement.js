import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  UserCheck, 
  UserX,
  Shield,
  Eye,
  Settings,
  MoreVertical,
  Filter
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import UserForm from './UserForm';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const { canManageUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // UI State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage
      };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';
      
      const response = await authService.getUsers(params);
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (canManageUsers()) {
      fetchUsers();
    }
  }, [fetchUsers, canManageUsers]);

  // Redirect if no permission
  if (!canManageUsers()) {
    return (
      <div className="no-permission">
        <Shield className="permission-icon" />
        <h3>Access Denied</h3>
        <p>You don't have permission to manage users.</p>
      </div>
    );
  }

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
    setShowActionsMenu(null);
  };

  const handleUserSaved = () => {
    setShowUserForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleCancelForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await authService.deactivateUser(userId);
      fetchUsers();
      setShowActionsMenu(null);
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await authService.activateUser(userId);
      fetchUsers();
      setShowActionsMenu(null);
    } catch (err) {
      console.error('Error activating user:', err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const toggleActionsMenu = (userId) => {
    setShowActionsMenu(showActionsMenu === userId ? null : userId);
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
        return <Users className="role-icon" />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div className="header-title">
          <Users className="header-icon" />
          <div>
            <h1>User Management</h1>
            <p>Manage system users and their permissions</p>
          </div>
        </div>
        <button onClick={handleCreateUser} className="create-user-button">
          <Plus />
          Add User
        </button>
      </div>

      <div className="user-management-controls">
        <div className="search-section">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value={UserRole.ADMINISTRATOR}>Administrator</option>
              <option value={UserRole.OPERATOR}>Operator</option>
              <option value={UserRole.VIEWER}>Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(searchTerm || roleFilter || statusFilter) && (
              <button onClick={clearFilters} className="clear-filters">
                <Filter />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-info-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.full_name}</div>
                          <div className="user-meta">
                            <span className="username">@{user.username}</span>
                            <span className="email">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="role-badge">
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </div>
                    </td>
                    
                    <td>
                      <div className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? <UserCheck /> : <UserX />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    
                    <td className="date-cell">
                      {formatDate(user.created_at)}
                    </td>
                    
                    <td className="date-cell">
                      {user.last_login ? formatDate(user.last_login) : '—'}
                    </td>
                    
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="edit-button"
                          title="Edit User"
                        >
                          <Edit />
                        </button>
                        
                        <div className="actions-menu">
                          <button
                            onClick={() => toggleActionsMenu(user.id)}
                            className="actions-menu-button"
                          >
                            <MoreVertical />
                          </button>
                          
                          {showActionsMenu === user.id && (
                            <div className="actions-dropdown">
                              {user.is_active ? (
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="action-item deactivate-action"
                                >
                                  <UserX />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  className="action-item activate-action"
                                >
                                  <UserCheck />
                                  Activate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalUsers === 0 && !loading ? (
            <div className="no-users">
              <Users />
              <h3>No Users Found</h3>
              <p>No users match your current filters.</p>
            </div>
          ) : (
            <div className="pagination">
              <div className="pagination-info">
                <span>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalUsers)} to{' '}
                  {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="items-per-page"
                >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
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
                  Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
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
          )}
        </>
      )}

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={showUserForm}
        onSave={handleUserSaved}
        onCancel={handleCancelForm}
      />
    </div>
  );
};

export default UserManagement;