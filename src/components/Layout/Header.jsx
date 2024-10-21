import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1>Welcome To Puppy Pros Training</h1>
      <h2>{user ? `Welcome, ${user.name}!` : 'Please Login'}</h2>
      <nav>
        <Link to="/">Home</Link>
        {user && user.role === 'trainer' && (
          <>
            <Link to="/clients">Clients</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/dashboard">Dashboard</Link>
          </>
        )}
        {user && user.role === 'admin' && (
          <>
            <Link to="/billing">Billing</Link>
            <Link to="/dashboard">Dashboard</Link>
          </>
        )}
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;

