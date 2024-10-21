import React, { createContext, useState, useContext } from 'react';
import usersMock from '../mocks/usersMock';

// Create a context for authentication and role management
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User can be null, trainer, client, or admin

  // Function to handle login, setting the user object
  const login = (username) => {
    // Find the user from the mock data based on the username
    const foundUser = usersMock.find((mockUser) => mockUser.username === username);

    if (foundUser) {
      setUser(foundUser); // Set the full user object here
    } else {
      console.error('User not found');
    }
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);



