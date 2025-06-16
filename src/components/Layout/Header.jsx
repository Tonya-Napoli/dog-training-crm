// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4">
              <img
                src="/pp-logo-removebg-preview.png"
                alt="Puppy Pros Training Logo"
                className="w-16 h-16"
              />
              <h1 className="text-xl font-bold">Puppy Pros Training</h1>
            </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <button
            className="block lg:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Home Link */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="hover:text-gray-200 transition duration-300"
              >
                Home
              </Link>
            )}

            {/* Authenticated User Links */}
            {user && (
              <>
                {/* Trainer Links */}
                {user.role === 'trainer' && (
                  <>
                    <Link
                      to="/clients"
                      className="hover:text-gray-200 transition duration-300"
                    >
                      Clients
                    </Link>
                    <Link
                      to="/schedule"
                      className="hover:text-gray-200 transition duration-300"
                    >
                      Schedule
                    </Link>
                    <Link
                      to="/trainer-dashboard"
                      className="hover:text-gray-200 transition duration-300"
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="hover:text-gray-200 transition duration-300"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Client Links */}
                {user.role === 'client' && (
                  <Link
                    to="/client-dashboard"
                    className="hover:text-gray-200 transition duration-300"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Welcome Message */}
                <span className="text-sm">
                  Welcome, <span className="font-bold">{user.name || user.username}</span>!
                </span>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300"
                >
                  Logout
                </button>
              </>
            )}

            {/* Non-authenticated User Links */}
            {!user && (
              <>
                {/* Register Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsRegisterDropdownOpen(false), 200)}
                    className="hover:text-gray-200 transition duration-300 flex items-center"
                  >
                    Register
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform ${
                        isRegisterDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isRegisterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <Link
                        to="/client/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Register as Client
                      </Link>
                      <Link
                        to="/trainer/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Register as Trainer
                      </Link>
                    </div>
                  )}
                </div>

                {/* Login Button */}
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4">
            <ul className="flex flex-col space-y-2">
              {/* Home Link */}
              {location.pathname !== '/' && (
                <li>
                  <Link
                    to="/"
                    className="block hover:text-gray-200 transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
              )}

              {/* Authenticated User Links */}
              {user && (
                <>
                  {/* Trainer Links */}
                  {user.role === 'trainer' && (
                    <>
                      <li>
                        <Link
                          to="/clients"
                          className="block hover:text-gray-200 transition duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Clients
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/schedule"
                          className="block hover:text-gray-200 transition duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Schedule
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/trainer-dashboard"
                          className="block hover:text-gray-200 transition duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Admin Links */}
                  {user.role === 'admin' && (
                    <li>
                      <Link
                        to="/admin-dashboard"
                        className="block hover:text-gray-200 transition duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  {/* Client Links */}
                  {user.role === 'client' && (
                    <li>
                      <Link
                        to="/client-dashboard"
                        className="block hover:text-gray-200 transition duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}

              {/* Non-authenticated User Links */}
              {!user && (
                <>
                  <li>
                    <Link
                      to="/client/register"
                      className="block hover:text-gray-200 transition duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register as Client
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/trainer/register"
                      className="block hover:text-gray-200 transition duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register as Trainer
                    </Link>
                  </li>
                  {location.pathname !== '/login' && (
                    <li>
                      <Link
                        to="/login"
                        className="bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 block text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;


