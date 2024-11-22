// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import users from '../mocks/usersMock';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePasswordReset = (e) => {
    e.preventDefault();

    // Find the user by email
    const user = users.find((u) => u.email === email);

    if (user) {
      // Mock behavior for sending a recovery email
      setMessage('A recovery email has been sent to your email address.');
    } else {
      setMessage('No account found with that email.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">Send Reset Link</button>
      </form>
      {message && <p className="info-message">{message}</p>}
      <button onClick={() => navigate('/login')} className="btn">Back to Login</button>
    </div>
  );
};

export default ForgotPassword;
