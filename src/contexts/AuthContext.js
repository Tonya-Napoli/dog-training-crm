import React, { createContext, useState, useContext } from 'react';
//import usersMock from '../mocks/UsersMock.js';

// Create a context for authentication and role management
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current logged-in user (can be null, trainer, client, or admin)

  // Function to handle login
  const login = (user) => {
    console.log('Login called with:', user);

    if (user) {
      setUser(user); // Store the full user object in state
      console.log('User logged in:', user);
    } else {
      console.error('User not found or invalid credentials');
    }
  };

  // Function to handle logout
  const logout = () => {
    setUser(null); // Clear the user state
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);




