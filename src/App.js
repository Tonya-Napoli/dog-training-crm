import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import ClientProfile from './components/ClientProfile';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import Billing from './components/Billing';
import Login from './pages/Login';
import PrivateRoute from './pages/PrivateRoute';
import Header from './components/Layout/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/clients"
          element={
            <PrivateRoute role="trainer">
              <ClientList />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients/add"
          element={
            <PrivateRoute role="trainer">
              <AddClient />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/:id"
          element={
            <PrivateRoute role="trainer">
              <ClientProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="trainer">
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute role="trainer">
              <Schedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <PrivateRoute role="admin">
              <Billing />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


