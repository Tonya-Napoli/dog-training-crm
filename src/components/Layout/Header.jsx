import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <h1>Welcome To Puppy Pros Training</h1>
      {user && <h2>Welcome, {user.name}!</h2>}

      <nav>
        {/* Conditionally render "Home" link only if not on the home page */}
        {location.pathname !== '/' && (
          <Link to="/">Home</Link>
        )}

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

        {/* Show Logout button if user is logged in, otherwise show Login button */}
        {user ? (
          <button onClick={logout} className="logout-button">Logout</button>
        ) : (
          location.pathname !== '/login' && (
            <button className="login-button">
              <Link to="/login" className="login-link">Login</Link>
            </button>
          )
        )}
      </nav>
    </header>
  );
};

export default Header;

