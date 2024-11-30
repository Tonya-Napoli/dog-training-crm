import React from "react";

const GetStarted = () => {
  return (
    <div>
      <h1>Our Programs</h1>
      <p>Welcome to our dog walking app! Here's what you need to know:</p>
      <ul>
        <li>In-home training sessions for your dog.</li>
        <li>Remote Private Training.</li>
        <li>AKC Fit Dog Training.</li>
        <li>Nose Work & Mental Enrichment Activities.</li>
      </ul>
      <p>
        <h2>Contact Us For More Information</h2>
        <p>Phone: (321)334-2934</p>
        <p>Email: pupmail@puppyprostraining.com</p>
      </p>
      <h2>Request a Free Consulation</h2>
      <form>
        <label>Name:
            <input type="text" name="name" required />
            </label>
        <label>Email:
            <input type="email" name="email" required />
            </label>
        <label>Phone:
            <input type="tel" name="phone" required />
        </label>
        <label>Message:
            <textarea name="message" required></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default GetStarted;