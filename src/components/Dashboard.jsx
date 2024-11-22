import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'client':
      return <Navigate to="/dashboard/client" />;
    case 'trainer':
      return <Navigate to="/dashboard/trainer" />;
    default:
      return <p>Error: Role not recognized.</p>;
  }
};

export default Dashboard;

