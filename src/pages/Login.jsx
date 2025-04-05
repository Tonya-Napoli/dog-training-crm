import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Common dashboard component with role-specific rendering
const Dashboard = () => {
  const { user, logout } = useAuth();

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role-specific content
  const renderRoleContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Admin Controls</h3>
            <p className="text-blue-800">Here you can manage all users and system settings.</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Manage Users
              </button>
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                System Settings
              </button>
            </div>
          </div>
        );
        
      case 'trainer':
        return (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-green-900 mb-2">Trainer Tools</h3>
            <p className="text-green-800">Manage your clients and their training programs.</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Client List
              </button>
              <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Create Program
              </button>
            </div>
          </div>
        );
        
      case 'client':
      default:
        return (
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-purple-900 mb-2">Client Dashboard</h3>
            <p className="text-purple-800">View your training programs and track your progress.</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                My Programs
              </button>
              <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                Track Progress
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-heading">
          Welcome, {user.username}!
        </h2>
        <button
          onClick={logout}
          className="bg-red text-white px-4 py-2 rounded hover:bg-red-dark"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
        
        {renderRoleContent()}
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Account</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {new Date(user.created).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;







