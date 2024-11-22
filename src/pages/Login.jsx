import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import users from '../mocks/usersMock';
import LoginForm from '../components/forms/LoginForm';
import '../App.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (username, password) => {
    // Find the user in the mock users data
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Successful login, assign role
      login(user.role);

      // Redirect based on role
      if (user.role === 'trainer') {
        navigate('/trainer-dashboard');
      } else if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
      return true; // Login successful
    }

    return false; // Login failed
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <LoginForm onLogin={handleLogin} />
      <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
    </div>
  );
};

export default Login;


