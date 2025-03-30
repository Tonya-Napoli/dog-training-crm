import React, { useState } from "react";

const GetStartedPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setStatus("Submitting...");

    try {
      const response = await fetch("http://localhost:4000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the entire form data object
      });

      if (response.ok) {
        setStatus("Request sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" }); // Reset form
      } else {
        const result = await response.json();
        setStatus(`Error: ${result.error || 'Failed to send'}`);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      setStatus("Failed to send request. Please try again.");
    }
  };

  return (
    <div className="bg-background text-heading min-h-screen flex flex-col items-center px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-pacifico text-red mb-4">
          Welcome to Puppy Pros Training
        </h1>
        <p className="text-lg sm:text-xl text-neutral max-w-2xl mx-auto">
          Discover how we can help you and your furry friend accelerate your training!
        </p>
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-brown font-medium text-heading mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:outline-none"
              rows="4"
              placeholder="Write your message"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white font-bold py-2 px-4 rounded hover:bg-accent-teal transition duration-200 w-full"
          >
            Submit
          </button>
        </form>
        {status && <p className="mt-4 text-center">{status}</p>}
      </section>
    </div>
  );
};

export default GetStartedPage;
