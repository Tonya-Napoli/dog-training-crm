import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DashboardTrainer from './pages/DashboardTrainer';
import DashboardClient from './pages/DashboardClient';
import DashboardAdmin from './pages/DashboardAdmin';
import ClientList from './pages/ClientList';
import AddClient from './pages/ClientAdd';
import ClientProfile from './components/ClientProfile';
import Schedule from './components/Schedule';
import Billing from './components/Billing';
import Login from './pages/Login';
import PrivateRoute from './pages/PrivateRoute';
import ForgotPassword from './components/ForgotPassword';
import Header from './components/Layout/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />

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



