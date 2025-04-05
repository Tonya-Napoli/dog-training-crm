import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import users from '../mocks/UsersMock'; // Comment this out for now

const Login = () => {
  console.log("Login component rendering");  // Add this line
  
  const { login } = useAuth();
  console.log("Auth context received:", { login });  // Add this line
  
  const navigate = useNavigate();
  // State for email, password, and error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Attempting login with:', email, password);
    
    // Temporarily simplify the login logic
    try {
      login({ email, role: 'client', username: 'Test User' }); // Just pass a simple object for now
      navigate('/client-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Error during login');
    }
  };

  // Render the UI without any conditional logic that might cause blank page
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-heading"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-heading"
            />
          </div>
          {error && <p className="text-danger text-xs italic mb-4">{error}</p>}
          <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;






