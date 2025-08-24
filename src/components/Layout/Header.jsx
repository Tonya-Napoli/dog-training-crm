import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Removed unused isRegisterDropdownOpen and setIsRegisterDropdownOpen

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold">Puppy Pros Training</h1>
          </Link>

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
                {/* Client Registration Link (No dropdown needed anymore) */}
                <Link
                  to="/client/register"
                  className="hover:text-gray-200 transition duration-300"
                >
                  Register
                </Link>

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


