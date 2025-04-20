import express from 'express';
import sgMail from '@sendgrid/mail';
import Contact from '../models/Contact.js'; 

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Submit contact form
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    await newContact.save();

    const msg = {
      to: 'info@puppyprostraining.com',
      from: 'contact@puppyprostraining.com',
      subject: `New Inquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p> <!-- Fixed: Uses email -->
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ success: 'Form submitted successfully. We will contact you soon!' });
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({
      error: 'Failed to process your request.',
      details: error.response?.body?.errors?.[0]?.message || error.message,
    });
  }
});

// Get all contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Update contact status
router.put('/contacts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Contacted', 'Scheduled', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update follow-up notes
router.put('/contacts/:id/notes', async (req, res) => {
  try {
    const { followUpNotes } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { followUpNotes },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Email API is working',
    sendgridConfigured: !!process.env.SENDGRID_API_KEY,
  });
});

export default router;