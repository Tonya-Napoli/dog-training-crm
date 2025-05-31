import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import PrivateRoute from './pages/PrivateRoute.js';
import ForgotPassword from './components/ForgotPassword.jsx';
import Header from './components/Layout/Header.jsx';
import GetStarted from './pages/GetStarted.jsx';
import ClientRegistrationPage from './pages/ClientRegistrationPage.jsx';
import TrainerRegistrationPage from './pages/TrainerRegistrationPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; // Add this import
// Import the protected admin creation component
import CreateAdminForm from './components/admin/CreateAdminForm.jsx';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        
        {/* Registration Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/client/register" element={<ClientRegistrationPage />} />
        <Route path="/trainer/register" element={<TrainerRegistrationPage />} />
        
        {/* NO PUBLIC ADMIN REGISTRATION - Removed for security */}

        {/* Trainer Dashboard and Nested Routes */}
        <Route
          path="/trainer-dashboard"
          element={
            <PrivateRoute role="trainer">
              <DashboardTrainer />
            </PrivateRoute>
          }
        >
          <Route
            path="clients"
            element={
              <PrivateRoute role="trainer">
                <ClientList />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/add"
            element={
              <PrivateRoute role="trainer">
                <AddClient />
              </PrivateRoute>
            }
          />
          <Route
            path="client/:id"
            element={
              <PrivateRoute role="trainer">
                <ClientProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="schedule"
            element={
              <PrivateRoute role="trainer">
                <Schedule />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Client Dashboard */}
        <Route
          path="client-dashboard"
          element={
            <PrivateRoute role="client">
              <DashboardClient />
            </PrivateRoute>
          }
        />

        {/* Admin Dashboard and Nested Routes */}
        <Route
          path="admin-dashboard"
          element={
            <PrivateRoute role="admin">
              <DashboardAdmin />
            </PrivateRoute>
          }
        >
          <Route
            path="billing"
            element={
              <PrivateRoute role="admin">
                <Billing />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Protected Admin Creation - Only accessible to existing admins */}
        <Route
          path="/admin/create-admin"
          element={
            <PrivateRoute role="admin">
              <CreateAdminForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


