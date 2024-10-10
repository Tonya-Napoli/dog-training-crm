import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import users from '../mocks/mockUsers';
import '../App.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

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
    } else {
      // Invalid credentials
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
};

export default Login;
