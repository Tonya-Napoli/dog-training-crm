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
      </Routes>
    </Router>
  );
}

export default App;



