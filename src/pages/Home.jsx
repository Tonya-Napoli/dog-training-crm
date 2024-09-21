//adding landing page
import React from 'react';
import '../App.css';

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to Puppy Pros</h1>
            <p>Your one-stop solution for managing dog training sessions and clients information.</p>
            <button onClick={() =>alert('Coming Soon!')}>Get Started</button>
        </div>
    );
};

export default Home;