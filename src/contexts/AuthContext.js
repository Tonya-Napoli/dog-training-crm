import React, { createContext, useState, useContext } from 'react';

//create a context for authentication and role management
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); //user can be null, trainer, client or admin

//Function to handle a loing, setting the user role
const login = (role) => {
    setUser({ role }); // Set the role to 'trainer', 'client', or 'admin'
};

//Function to handle logout
const logout = () => {
    setUser(null);
};

return (
    <AuthContext.Provider value={{ user, login, logout }}>
        {children}
    </AuthContext.Provider>
)
};

//Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);