import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Password reset instructions have been sent to your email.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h2 className="text-3xl font-bold text-heading mb-6">Forgot Password?</h2>
      <form
        onSubmit={handleSubmit}
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
            autoComplete="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-heading leading-tight focus:outline-none focus:ring focus:ring-accent-cyan"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Send Reset Link
        </button>
      </form>
      {message && (
        <p className="text-accent-cyan text-center mt-4 font-semibold">{message}</p>
      )}
    </div>
  );
};

export default ForgotPassword;


