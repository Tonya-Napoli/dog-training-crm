// src/api/routes/emailRoutes.js
import express from 'express';
import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';

const router = express.Router();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create a Contact schema and model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Use a new collection called 'contacts' instead of 'users'
const Contact = mongoose.model('Contact', contactSchema);

// Main contact form endpoint
router.post('/send-email', async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    
    // 1. Save to database
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        message
      });
      
      await newContact.save();
      console.log('Contact saved to database with ID:', newContact._id);
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue with email sending even if database save fails
    }
    
    // 2. Send email
    const msg = {
      to: 'info@puppyprostraining.com', // Your business email
      from: 'contact@puppyprostraining.com', // Must use your verified domain
      subject: `New Inquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };
    
    console.log('Sending email with data:', msg);
    
    const response = await sgMail.send(msg);
    console.log('SendGrid response:', response[0].statusCode);
    
    res.status(200).json({ success: 'Form submitted successfully. We will contact you soon!' });
  } catch (error) {
    console.error('Error processing form:', error);
    
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    res.status(500).json({
      error: 'Failed to process your request.',
      details: error.response?.body?.errors?.[0]?.message || error.message
    });
  }
});

// Get all contacts (for admin/testing purposes)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Optional: Add a test endpoint to verify the API is working
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Email API is working',
    sendgridConfigured: !!process.env.SENDGRID_API_KEY
  });
});

export default router;