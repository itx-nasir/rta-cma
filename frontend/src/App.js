import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CameraDashboard from './components/CameraDashboard';
import CameraDetails from './components/CameraDetails';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>RTA Camera Management System</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CameraDashboard />} />
            <Route path="/camera/:id" element={<CameraDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;