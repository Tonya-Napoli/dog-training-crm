import React from "react";
//import '@fontsource/pacifico'; // Defaults to regular weight
const GetStartedPage = () => {
  return (
    <div className="bg-background text-heading min-h-screen flex flex-col items-center px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-pacifico text-red mb-4">
          Welcome to Puppy Pros Training
        </h1>
        <p className="text-lg sm:text-xl text-neutral max-w-2xl mx-auto">
          Discover how we can help you and your furry friend excelerate your training!
        </p>
      </section>

      {/* What We Offer Section */}
      <section className="mb-12 max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-bold font-pacifico text-primary mb-6 text-center">
          What We Offer
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-neutral text-base sm:text-lg">
          <li>In-home dog training sessions</li>
          <li>Remote private training</li>
        </ul>
      </section>

      {/* Contact Us Section */}
      <section className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center">
          Contact Us
        </h2>
        <div className="text-center text-brown mb-6">
          <p>Phone: <span className="text-link text-red">(321)-209-0504</span></p>
          <p>Email: <span className="text-link text-red">trainingchat@puppyprostraining.com</span></p>
        </div>
        <h3 className="text-lg font-semibold text-brown text-heading mb-2">
          Request a Free Consultation
        </h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-brown font-medium text-heading mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:outline-none"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Phone
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:outline-none"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Message
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:outline-none"
              rows="4"
              placeholder="Write your message"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white font-bold py-2 px-4 rounded hover:bg-accent-teal transition duration-200 w-full"
          >
            Submit
          </button>
        </form>
      </section>
    </div>
  );
};

export default GetStartedPage;
