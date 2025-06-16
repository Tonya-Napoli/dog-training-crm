import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for responsive menu

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <img
            src="/pp-logo-removebg-preview.png"
            alt="Puppy Pros Training Logo"
            className="w-16 h-16"
          />
          <h1 className="text-xl font-bold">Puppy Pros Training</h1>
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className="block lg:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Welcome Message */}
        <div className="hidden lg:block">
          {user && (
            <h2 className="text-lg">
              Welcome, <span className="font-bold">{user.name}</span>!
            </h2>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav
        className={`lg:flex ${
          isMenuOpen ? 'block' : 'hidden'
        } mt-4 lg:mt-0 lg:items-center`}
      >
        <ul className="flex flex-col lg:flex-row lg:space-x-6 items-center text-lg">
          {/* Conditionally render "Home" link */}
          {location.pathname !== '/' && (
            <li>
              <Link
                to="/"
                className="hover:text-[#e1e1e8de] transition duration-300"
              >
                Home
              </Link>
            </li>
          )}

          {/* Trainer Links */}
          {user && user.role === 'trainer' && (
            <>
              <li>
                <Link
                  to="/clients"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Clients
                </Link>
              </li>
              <li>
                <Link
                  to="/schedule"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  to="/trainer-dashboard"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Dashboard
                </Link>
              </li>
            </>
          )}

          {/* Admin Links */}
          {user && user.role === 'admin' && (
            <>
              <li>
                <Link
                  to="/billing"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Billing
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-dashboard"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Dashboard
                </Link>
              </li>
            </>
          )}

          {/* Client Links */}
          {user && user.role === 'client' && (
            <li>
              <Link
                to="/client-dashboard"
                className="hover:text-[#4747cbde] transition duration-300"
              >
                Dashboard
              </Link>
            </li>
          )}

          {/* Login/Logout */}
          <li>
            {user ? (
              <button
                onClick={logout}
                className="bg-white text-primary font-bold py-1 px-4 rounded hover:bg-gray-200 transition duration-300"
              >
                Logout
              </button>
            ) : (
              location.pathname !== '/login' && (
                <Link
                  to="/login"
                  className="bg-white text-primary font-bold py-1 px-4 rounded hover:bg-gray-200 transition duration-300"
                >
                  Login
                </Link>
              )
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;


