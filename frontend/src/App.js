import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import Header from './components/Header';
import CameraDashboard from './components/CameraDashboard';
import CameraDetails from './components/CameraDetails';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import LocationManagement from './components/LocationManagement';
import NvrManagement from './components/NvrManagement';
import './styles/App.css';

// Protected Route Component
function ProtectedRoute({ children, requiredRoles = null }) {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-message">
          <h3>Access Denied</h3>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return children;
}

// App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="App">
      {isAuthenticated && <Header />}
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <CameraDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/camera/:id" 
            element={
              <ProtectedRoute>
                <CameraDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMINISTRATOR]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/locations" 
            element={
              <ProtectedRoute>
                <LocationManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/nvrs" 
            element={
              <ProtectedRoute>
                <NvrManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;