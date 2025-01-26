require('dotenv').config(); // For local development

const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

//SendGrid API Key config
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log('API Key:', process.env.SENDGRID_API_KEY);

// Route to send email
app.post('/send-email', async (req, res) => {
 const { to, subject, text } = req.body;

 const msg = {
   from: 'Dog Training CRM <pupmail@puppyprostraining.com>',
   to: 
   subject,
   text,
 };

 try {
   const response = await sgMail.send(msg);
   res.status(200).json({ message: 'Email sent successfully', response });
 } catch (error) {
   console.error('Error sending email:', error);
   res.status(500).json({ error: 'Failed to send email' });
 }
});

app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});

