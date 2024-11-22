import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import users from '../mocks/usersMock';
import '../App.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State for email, password, and error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Entered email:', email);
    console.log('Entered password:', password);
    console.log('Mock Users:', users);

    // Search for the user in the mock users data
    const user = users.find(
      (u) =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password.trim() === password.trim()
    );

    if (user) {
      console.log('Matched User:', user);
      login(user); // Pass role to the AuthContext
      navigate(`/${user.role}-dashboard`); // Redirect to the appropriate dashboard
    } else {
      console.error('Invalid email or password');
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Login</button>
      </form>
      <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
    </div>
  );
};

export default Login;






