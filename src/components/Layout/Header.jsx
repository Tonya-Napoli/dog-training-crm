import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRegisterDropdown(false);
      }
    };

    if (showRegisterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegisterDropdown]);

  const handleRegistrationSelect = (type) => {
    setShowRegisterDropdown(false);
    if (type === 'client') {
      navigate('/client/register');
    } else if (type === 'trainer') {
      navigate('/trainer/register');
    }
  };

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
                  to="/dashboard"
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
                  to="/dashboard"
                  className="hover:text-[#4747cbde] transition duration-300"
                >
                  Dashboard
                </Link>
              </li>
            </>
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

          {/* Register Dropdown - Only show when not logged in */}
          {!user && (
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
                className="bg-white text-primary font-bold py-1 px-4 rounded hover:bg-gray-200 transition duration-300 flex items-center gap-2"
              >
                Register
                <svg 
                  className={`w-3 h-3 transition-transform ${showRegisterDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showRegisterDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]">
                  <button
                    onClick={() => handleRegistrationSelect('client')}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition duration-200"
                  >
                    <div className="font-semibold text-primary">Register as Client</div>
                    <div className="text-sm text-gray-600">Start training your dog</div>
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => handleRegistrationSelect('trainer')}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition duration-200"
                  >
                    <div className="font-semibold text-primary">Register as Trainer</div>
                    <div className="text-sm text-gray-600">Join our team of experts</div>
                  </button>
                </div>
              )}
            </li>
          )}

          
        </ul>
      </nav>
    </header>
  );
};

export default Header;


