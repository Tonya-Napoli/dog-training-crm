import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminForm from '../components/forms/AdminForm';
import ClientForm from '../components/forms/ClientForm';
import TrainerForm from '../components/forms/TrainerForm';

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('client');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  // Function to render the appropriate registration form based on role
  const renderForm = () => {
    switch (selectedRole) {
      case 'admin':
        return <AdminForm />;
      case 'trainer':
        return <TrainerForm />;
      case 'client':
      default:
        return <ClientForm />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-heading mb-6">Create Your Account</h1>
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                selectedRole === 'client'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('trainer')}
              className={`px-4 py-2 text-sm font-medium ${
                selectedRole === 'trainer'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-100'
              }`}
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                selectedRole === 'admin'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
        
        <div className="form-container">
          {renderForm()}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;