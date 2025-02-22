import express from 'express';
import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';

config(); // Load environment variables

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

router.post('/send', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const msg = {
      to: 'info@puppyprostraining.com', // Replace with your official email
      from: 'pupmail@puppyprostraining.com', // Must be verified in SendGrid
      subject: `New Message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

export default router;
