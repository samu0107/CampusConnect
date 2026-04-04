import React, { lazy, Suspense } from 'react';
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
<<<<<<< HEAD
import AdminAccommodationPage from "./pages/AdminAccommodationPage";
import TimeManagementPage from "./pages/TimeManagementPage.tsx";
import { AuthProvider } from "./context/AuthContext";

const AccommodationsPage = lazy(() => import('./pages/AccommodationsPage.tsx'));
const AccommodationDetail = lazy(() => import('./components/accommodation/AccommodationDetail.tsx'));
const AccommodationForm = lazy(() => import('./components/accommodation/AccommodationForm.tsx'));


=======
import AdminQAManager from './components/AdminQAManager.jsx';
import Marketplace from './components/Marketplace.jsx';
import AdminMarketplace from './components/AdminMarketplace.jsx';
import Accommodation from './components/Accommodation.jsx';
import AdminAccommodation from './components/AdminAccommodation.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import ApplicationTracker from './components/ApplicationTracker.jsx';
>>>>>>> b22d0fe6145d37fbe98664d2543db0f55edd837c

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
<<<<<<< HEAD
        <Route path="/accommodations" element={<AccommodationsPage />} />
        <Route path="/accommodations/new" element={<AccommodationForm />} />
        <Route path="/accommodations/:id/edit" element={<AccommodationForm />} />
        <Route path="/accommodations/:id" element={<AccommodationDetail />} />
        <Route path="/admin/accommodations" element={<AdminAccommodationPage />} />
        <Route path="/time-management" element={<TimeManagementPage />} />
=======
        <Route
          path="/marketplace"
          element={<Marketplace />}
        />
>>>>>>> b22d0fe6145d37fbe98664d2543db0f55edd837c
        <Route
          path="/study-support"
          element={<div className="p-8 text-center">Study Support</div>}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

