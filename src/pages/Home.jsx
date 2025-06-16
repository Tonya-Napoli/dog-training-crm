import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

const Home = () => {
  return (
    <div className="bg-background text-heading">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-primary text-brown text-center p-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-pacifico mb-4">
          Your Partner in Raising a Well-Behaved Dog
        </h1>
        <p className="text-base sm:text-lg lg:text-xl mb-6 max-w-2xl">
          Join our community and give your dog the best training experience.
        </p>
        <Link
          to="/get-started"
          className="bg-white text-primary font-bold py-3 px-6 rounded shadow hover:bg-gray-200 transition duration-200"
        >
          Request a Free Consultation
        </Link>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-pacifico mb-4">
          About Puppy Pros Training
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-4xl mx-auto">
          At Puppy Pros Training, we believe every dog can be an amazing companion
          with the right guidance. We offer personalized, effective, and positive
          dog training solutions.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-6 bg-gray-100">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-pacifico text-center mb-8">
          Our Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Track Training Progress
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Monitor how your dog is mastering new skills.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Convenient Scheduling
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Book your training sessions with ease.
            </p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Personalized Training
            </h3>
            <p className="text-neutral text-sm sm:text-base">
              Get matched with a certified trainer who knows your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 px-6 text-center bg-background">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-pacifico font-bold mb-8">
          What Our Clients Say
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto italic text-neutral mb-4">
          "Puppy Pros helped our dog become an obedient and joyful part of our family!" - Sarah K.
        </p>
        <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto italic text-neutral">
          "The trainers are amazing and very knowledgeable. Highly recommend!" - James L.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Home;




