import React from 'react';
import {  useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css'; 

const Login = () => {
    const { login } = useAuth(); //Use the login function from the AuthContext
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role); //Set user role as "trainer", "client", or "admin"
        navigate('/'); //Navigate to the home page after logging in
    };

    return (
        <div className="login-container">
            <h2>Login as:</h2>
            <button className="btn" onClick={() => handleLogin('trainer')}>
                Login as Trainer
                </button>
                <button className="btn" onClick={() => handleLogin('client')}>
                Login as Client
                </button>
        </div>
    );
    };

    export default Login;
    
