import 'dotenv/config'; // Loads environment variables
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sgMail from '@sendgrid/mail';

console.log("Running updated server.js with ES modules");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  const msg = {
    from: 'Dog Training CRM <pupmail@puppyprostraining.com>',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    console.log('Sending email to:', to);
    const response = await sgMail.send(msg);
    console.log('SendGrid Response:', response);
    res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

