import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header'; 
import Footer from '../components/Layout/Footer'; 
import '../App.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Your Partner in Raising a Well-Behaved Dog</h1>
        <p>Join our community and give your dog the best training experience.</p>
        <Link to="/login" className="cta-button">Get Started</Link>
      </section>

      <section className="about-section">
        <h2>About Puppy Pros Training</h2>
        <p>
          At Puppy Pros Training, we believe every dog can be an amazing companion with the right guidance. We offer personalized, effective, and positive dog training solutions.
        </p>
      </section>

      <section className="features-section">
        <h2>Our Features</h2>
        <div className="features-container">
          <div className="feature-card">
            <h3>Track Training Progress</h3>
            <p>Monitor how your dog is mastering new skills.</p>
          </div>
          <div className="feature-card">
            <h3>Convenient Scheduling</h3>
            <p>Book your training sessions with ease.</p>
          </div>
          <div className="feature-card">
            <h3>Personalized Training</h3>
            <p>Get matched with a certified trainer who knows your needs.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>What Our Clients Say</h2>
        <p>"Puppy Pros helped our dog become an obedient and joyful part of our family!" - Sarah K.</p>
        <p>"The trainers are amazing and very knowledgeable. Highly recommend!" - James L.</p>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;

