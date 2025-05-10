import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DemoLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo credentials for testing different roles
  const demoUsers = {
    admin: { email: 'admin@example.com', password: 'password123' },
    trainer: { email: 'trainer@example.com', password: 'password123' },
    client: { email: 'client@example.com', password: 'password123' }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    setError('');
    
    try {
      // For demo purposes, we'll simulate a successful login
      // In a real app, this would call the actual login endpoint
      await login(demoUsers[role].email, demoUsers[role].password);
      
      // Navigate based on role
      switch (role) {
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
    } catch (err) {
      setError('Demo login failed. Please try again.');
      console.error('Demo login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 text-center">Demo Mode</h3>
      
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      
      <div className="flex flex-col space-y-3">
        <button
          onClick={() => handleDemoLogin('client')}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Login as Client
        </button>
        
        <button
          onClick={() => handleDemoLogin('trainer')}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Login as Trainer
        </button>
        
        <button
          onClick={() => handleDemoLogin('admin')}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Login as Admin
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        These buttons simulate login with different user roles for demonstration purposes.
      </p>
    </div>
  );
};

export default DemoLogin;