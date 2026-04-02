import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './style.css';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import MainDashboard from './components/MainDashboard.jsx';
import JobPortal from './components/Dashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AdminJobPortal from './components/AdminJobPortal.jsx';
import AdminApplicationViewer from './components/AdminApplicationViewer.jsx';
import AdminQAManager from './components/AdminQAManager.jsx';
import Marketplace from './components/Marketplace.jsx';
import AdminMarketplace from './components/AdminMarketplace.jsx';
import Accommodation from './components/Accommodation.jsx';
import AdminAccommodation from './components/AdminAccommodation.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import ApplicationTracker from './components/ApplicationTracker.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Student routes */}
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/jobs" element={<JobPortal />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/applications/track" element={<ApplicationTracker />} />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobPortal />} />
        <Route path="/admin/applications" element={<AdminApplicationViewer />} />
        <Route path="/admin/qa" element={<AdminQAManager />} />
        <Route path="/admin/marketplace" element={<AdminMarketplace />} />
        <Route path="/admin/accommodation" element={<AdminAccommodation />} />

        {/* Group member placeholders */}
        <Route
          path="/accommodation"
          element={<Accommodation />}
        />
        <Route
          path="/marketplace"
          element={<Marketplace />}
        />
        <Route
          path="/study-support"
          element={<div className="p-8 text-center">Study Support</div>}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

