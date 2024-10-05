import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import '../../App.css'; 
import logo from '../../images/pp-logo.png';


function Header() {
    const { user, login, logout } = useAuth();

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="Puppy Pros Logo" className="logo" />
                </Link>
            </div>
            <nav>
        {/* Conditionally render navigation links based on login status */}
        {user && (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/clients" className="nav-link">Clients</Link>
            <Link to="/schedule" className="nav-link">Schedule</Link>
            <Link to="/billing" className="nav-link">Billing</Link>
          </>
        )}
      </nav>
      <div className="auth-buttons">
        {/* Show login/logout button based on user status */}
        {user ? (
            <button className="logout-button" onClick={logout}>
                Logout
            </button>
        ) : (
            <button className="login-button" onClick={() => login('trainer')}>
                Login
            </button>
        )}
      </div>
    </header>
    );
}

export default Header;


