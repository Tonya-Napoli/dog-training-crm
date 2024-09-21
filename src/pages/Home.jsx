import React from 'react';

const Home = () => {
    return (
        <div style= {{ textAlign: 'center', padding: '20px'}}>
            <h1>Welcome to Puppy Pros</h1>
            <p>Your one-stop solution for managing dog training sessions and clients information.</p>
            <button onClick={() =>alert('Coming Soon!')}>Get Started</button>
        </div>
    );
};

export default Home;