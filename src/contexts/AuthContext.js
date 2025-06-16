import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axios.js'; // Use your configured axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        
        try {
          // Use relative path since axios already has base URL
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

  const login = async (email, password) => {
    setError(null);
    
    try {
      // Use relative path
      const res = await axios.post('/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      
      console.log('User logged in:', res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err.response?.data || err);
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);
    
    try {
      // Use relative path
      const res = await axios.post('/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      
      console.log('User registered:', res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err.response?.data || err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    console.log('User logged out');
  };

  const clearError = () => {
    setError(null);
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
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

