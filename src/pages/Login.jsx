import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import users from '../mocks/usersMock';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h2 className="text-3xl font-bold text-red text-heading mb-6">Login</h2>
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-heading text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-heading leading-tight focus:outline-none focus:ring focus:ring-accent-cyan"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-heading text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-heading leading-tight focus:outline-none focus:ring focus:ring-accent-cyan"
          />
        </div>
        {error && (
          <p className="text-danger text-xs italic mb-4">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
          <Link
            to="/forgot-password"
            className="inline-block align-baseline font-bold text-red text-sm text-link hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;







