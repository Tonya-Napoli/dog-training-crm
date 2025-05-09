import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axios.js';

// Create a context for authentication and role management
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if there's a token in localStorage on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Set auth token header
        axios.defaults.headers.common['x-auth-token'] = token;
        
        try {
          // Verify token and get user data
          const res = await axios.get('/auth/user');
          setUser(res.data);
        } catch (err) {
          console.error('Token validation error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Function to handle login
  const login = async (email, password) => {
    setError(null);
    
    try {
      const res = await axios.post('/auth/login', {
        email,
        password
      });
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set axios default header
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Set user state
      setUser(res.data.user);
      
      console.log('User logged in:', res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data || err);
      return false;
    }
  };

  // Function to handle registration
  const register = async (userData) => {
    setError(null);
    
    try {
      const res = await axios.post('/auth/register', userData);
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set axios default header
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Set user state
      setUser(res.data.user);
      
      console.log('User registered:', res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err.response?.data || err);
      return false;
    }
  };

  // Function to handle logout
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Clear user state
    setUser(null);
    
    console.log('User logged out');
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      loading,
      error,
      clearError,
      isAuthenticated: !!user,
      getUserRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);



