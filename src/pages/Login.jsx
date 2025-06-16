import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'trainer':
          navigate('/trainer-dashboard');
          break;
        case 'client':
          navigate('/client-dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    clearError && clearError();
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const success = await login(email, password);
      
      if (!success) {
        setError(authError || 'Invalid email or password');
      }
      // Navigation will be handled by useEffect if login is successful
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h2 className="text-3xl font-bold text-heading mb-6">Login</h2>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-heading text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-heading focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-heading text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-heading focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>
          {(error || authError) && (
            <p className="text-red-500 text-xs italic mb-4">{error || authError}</p>
          )}
          <button 
            type="submit" 
            className="bg-primary text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <Link to="/get-started" className="text-sm text-blue-600 hover:underline">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;




