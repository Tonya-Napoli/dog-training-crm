import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.js';

// Pages
import Home from './pages/Home.jsx';
import DashboardTrainer from './pages/DashboardTrainer.jsx';
import DashboardClient from './pages/DashboardClient.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import ClientList from './pages/ClientList.jsx';
import AddClient from './pages/ClientAdd.jsx';
import ClientProfile from './components/ClientProfile.jsx';
import Schedule from './components/Schedule.jsx';
import Billing from './components/Billing.jsx';
import Login from './pages/Login.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PrivateRoute from './pages/PrivateRoute.js';
import ForgotPassword from './components/ForgotPassword.jsx';
import Header from './components/Layout/Header.jsx';
import GetStarted from './pages/GetStarted.jsx';
import LoginSuccessHandler from './components/LoginSuccessHandler.jsx';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/auth-success" element={<LoginSuccessHandler />} />

        {/* Dashboard Route - Redirects based on role */}
        <Route path="/dashboard" element={<LoginSuccessHandler />} />

        {/* Trainer Dashboard and Nested Routes */}
        <Route
          path="/trainer-dashboard/*"
          element={
            <PrivateRoute role="trainer">
              <DashboardTrainer />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer-dashboard/clients"
          element={
            <PrivateRoute role="trainer">
              <ClientList />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer-dashboard/clients/add"
          element={
            <PrivateRoute role="trainer">
              <AddClient />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer-dashboard/client/:id"
          element={
            <PrivateRoute role="trainer">
              <ClientProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer-dashboard/schedule"
          element={
            <PrivateRoute role="trainer">
              <Schedule />
            </PrivateRoute>
          }
        />

        {/* Client Dashboard */}
        <Route
          path="/client-dashboard/*"
          element={
            <PrivateRoute role="client">
              <DashboardClient />
            </PrivateRoute>
          }
        />

        {/* Admin Dashboard and Nested Routes */}
        <Route
          path="/admin-dashboard/*"
          element={
            <PrivateRoute role="admin">
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard/billing"
          element={
            <PrivateRoute role="admin">
              <Billing />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


