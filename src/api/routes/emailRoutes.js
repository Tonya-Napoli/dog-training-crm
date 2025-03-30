// src/api/routes/emailRoutes.js
import express from 'express';
import sgMail from '@sendgrid/mail';

const router = express.Router();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Main contact form endpoint
router.post('/send-email', async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    
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
    
    res.status(200).json({ success: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    res.status(500).json({ 
      error: 'Failed to send email.',
      details: error.response?.body?.errors?.[0]?.message || error.message
    });
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