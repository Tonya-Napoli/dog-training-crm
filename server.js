import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';

// Check for SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is missing. Check your .env file.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Handle contact form submissions
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const msg = {
      to: 'info@puppyprostraining.com', // Replace with your recipient email
      from: 'pupmail@puppyprostraining.com', // Your verified sender
      subject: `New Inquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    console.log('Sending email with payload:', JSON.stringify(msg, null, 2));
    const response = await sgMail.send(msg);
    console.log('SendGrid Response:', response[0].statusCode, response[0]?.headers);
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.response?.body?.errors || error.message 
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Puppy Pros Training API');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

