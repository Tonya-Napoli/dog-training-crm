const express = require('express');
const bodyParser = require('body-parser');
const mailgun = require('mailgun-js');

require('dotenv').config(); // For local development

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Mailgun configuration
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// Route to send email
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  const data = {
    from: 'Dog Training CRM <mailgun@yourdomain.com>',
    to,
    subject,
    text,
  };

  try {
    const response = await mg.messages().send(data);
    res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
