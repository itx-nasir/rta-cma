import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

// User roles
export const UserRole = {
  ADMINISTRATOR: 'administrator',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          // Verify token and get user profile
          const userProfile = await authService.getProfile(storedToken);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: userProfile,
              token: storedToken
            }
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authService.login(username, password);
      
      // Store token
      localStorage.setItem('auth_token', response.access_token);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.access_token
        }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Permission checking functions
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const canCreate = () => {
    return state.user?.can_create || false;
  };

  const canEdit = () => {
    return state.user?.can_edit || false;
  };

  const canDelete = () => {
    return state.user?.can_delete || false;
  };

  const canManageUsers = () => {
    return state.user?.can_manage_users || false;
  };

  const isAdministrator = () => {
    return hasRole(UserRole.ADMINISTRATOR);
  };

  const isOperator = () => {
    return hasRole(UserRole.OPERATOR);
  };

  const isViewer = () => {
    return hasRole(UserRole.VIEWER);
  };

  const canAccessLocation = (locationId) => {
    // Administrators can access all locations
    if (isAdministrator()) return true;
    
    // If user has assigned location, check if it matches
    if (state.user?.assigned_location_id) {
      return state.user.assigned_location_id === locationId;
    }
    
    // Operators without assigned location can access all (adjust based on business rules)
    return isOperator();
  };

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateUser,
    clearError,
    
    // Permission checks
    hasRole,
    hasAnyRole,
    canCreate,
    canEdit,
    canDelete,
    canManageUsers,
    isAdministrator,
    isOperator,
    isViewer,
    canAccessLocation,
    
    // Utilities
    getAuthHeader: () => state.token ? { Authorization: `Bearer ${state.token}` } : {}
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected components
export function withAuth(Component, requiredRoles = null) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, hasAnyRole, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div className="unauthorized">Please log in to access this page.</div>;
    }
    
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return <div className="forbidden">You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
}

// Permission-based component wrapper
export function PermissionWrapper({ 
  children, 
  role = null, 
  roles = null, 
  permission = null, 
  fallback = null 
}) {
  const auth = useAuth();
  
  let hasPermission = true;
  
  if (role) {
    hasPermission = auth.hasRole(role);
  } else if (roles) {
    hasPermission = auth.hasAnyRole(roles);
  } else if (permission) {
    switch (permission) {
      case 'create':
        hasPermission = auth.canCreate();
        break;
      case 'edit':
        hasPermission = auth.canEdit();
        break;
      case 'delete':
        hasPermission = auth.canDelete();
        break;
      case 'manage_users':
        hasPermission = auth.canManageUsers();
        break;
      default:
        hasPermission = false;
    }
  }
  
  if (!hasPermission) {
    return fallback || null;
  }
  
  return children;
}