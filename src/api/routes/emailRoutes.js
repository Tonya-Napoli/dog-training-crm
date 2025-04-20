import express from 'express';
import sgMail from '@sendgrid/mail';
import Contact from '../models/Contact.js';
import auth from '../middleware/auth.js';

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Submit contact form (public)
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
        <p><strong>Email:</strong> ${email}</p>
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

// Get all contacts (protected, admin-only)
router.get('/contacts', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;
    const { status, search } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);
    const total = await Contact.countDocuments(query);
    res.status(200).json({ contacts, total, page, perPage });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Update contact status (protected, admin-only)
router.put('/contacts/:id/status', auth, async (req, res) => {
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

// Update follow-up notes (protected, admin-only)
router.put('/contacts/:id/notes', auth, async (req, res) => {
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

// Test route (public)
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Email API is working',
    sendgridConfigured: !!process.env.SENDGRID_API_KEY,
  });
});

export default router;