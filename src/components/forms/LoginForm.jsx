import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginSuccess = onLogin(username, password);

    if (!loginSuccess) {
      setError('Invalid username or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
  );
};

export default LoginForm;
