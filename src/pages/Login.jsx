import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🚀 Login attempt for:', email);
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call the login function from AuthContext
      const success = await login(email, password);
      
      if (success) {
        console.log('✅ Login successful!');
        
        // Give AuthContext a moment to set user state, then navigate based on role
        setTimeout(() => {
          // Get user from localStorage or make another call to check role
          const token = localStorage.getItem('token');
          if (token) {
            // For now, since you're testing admin, go directly to admin dashboard
            console.log('🎯 Navigating to admin dashboard...');
            navigate('/admin-dashboard');
          }
        }, 100); // Small delay to ensure user state is set
        
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h2 className="text-3xl font-bold text-red text-heading mb-6">Login</h2>
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
              placeholder="Enter your email"
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
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-link hover:text-link-hover text-sm">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;





