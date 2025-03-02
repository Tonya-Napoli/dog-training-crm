import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

const PrivateRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    // Redirect to home if the role doesn't match
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;

