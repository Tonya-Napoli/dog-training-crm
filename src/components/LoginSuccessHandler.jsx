import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginSuccessHandler = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not authenticated, redirect to login
        navigate('/login');
        return;
      }

      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'trainer':
          navigate('/trainer-dashboard');
          break;
        case 'client':
        default:
          navigate('/client-dashboard');
          break;
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-heading">Redirecting you to your dashboard...</h2>
      </div>
    </div>
  );
};

export default LoginSuccessHandler;