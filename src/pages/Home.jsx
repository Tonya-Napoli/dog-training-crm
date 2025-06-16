// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

const Home = () => {
  return (
    <div className="bg-background text-heading">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-primary text-white text-center p-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-pacifico mb-4">
          Your Partner in Raising a Well-Behaved Dog
        </h1>
        <p className="text-base sm:text-lg lg:text-xl mb-6 max-w-2xl">
          Join our community and give your dog the best training experience.
        </p>
        <Link
          to="/get-started"
          className="bg-white text-primary font-bold py-3 px-6 rounded shadow hover:bg-gray-200"
        >
          Request a Free Consultation
        </Link>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-pacifico mb-4">
          About Us
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-4xl mx-auto">
          At Puppy Pros Training, we believe every dog can be an amazing companion
          with the right guidance. We offer personalized, effective, and positive
          dog training solutions tailored to your pet's unique needs.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-6 bg-gray-100">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-pacifico text-center mb-8">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Track Training Progress
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Monitor your dog's journey as they master new skills and behaviors.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Convenient Scheduling
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Book training sessions that fit your busy lifestyle with our flexible scheduling.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Certified Trainers
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Work with experienced, certified professionals who understand your dog's needs.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Personalized Plans
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Every dog is unique - get a training plan customized for your pet's personality.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Positive Methods
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              We use reward-based training techniques that build trust and confidence.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Ongoing Support
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Get continued guidance even after your training sessions are complete.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-pacifico font-bold mb-8">
          Our Training Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-primary">Puppy Training</h3>
            <p className="text-sm sm:text-base mb-4">Start your puppy off right with basic obedience, socialization, and house training.</p>
            <p className="font-bold text-lg">Starting at $400</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-primary">Basic Obedience</h3>
            <p className="text-sm sm:text-base mb-4">Essential commands like sit, stay, come, and leash manners for dogs of all ages.</p>
            <p className="font-bold text-lg">Starting at $600</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-primary">Advanced Training</h3>
            <p className="text-sm sm:text-base mb-4">Take training to the next level with advanced commands and specialized skills.</p>
            <p className="font-bold text-lg">Starting at $1,000</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 px-6 text-center bg-gray-100">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-pacifico font-bold mb-8">
          What Our Clients Say
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm sm:text-base lg:text-lg italic text-neutral mb-4">
              "Puppy Pros helped our dog become an obedient and joyful part of our family! The trainers are patient and really know their stuff."
            </p>
            <p className="font-bold">- Sarah K.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm sm:text-base lg:text-lg italic text-neutral mb-4">
              "The trainers are amazing and very knowledgeable. Our rescue dog went from anxious to confident in just a few weeks!"
            </p>
            <p className="font-bold">- James L.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-6 text-center bg-primary text-white">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto">
          Take the first step towards a better relationship with your dog.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/get-started"
            className="bg-white text-primary font-bold py-3 px-6 rounded shadow hover:bg-gray-200"
          >
            Request Consultation
          </Link>
          <Link
            to="/client/register"
            className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded hover:bg-white hover:text-primary transition"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;




