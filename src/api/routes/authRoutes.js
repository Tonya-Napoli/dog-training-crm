// src/api/routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import User from '../models/User.js';
import TrainerInvite from '../models/TrainerInvite.js';
import TrainerNote from '../models/TrainerNote.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ======================
// Helper Functions
// ======================

// Create JWT token
const createToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

// Format user response
const formatUserResponse = (user) => ({
  id: user.id,
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  email: user.email,
  username: user.username,
  role: user.role,
  phone: user.phone,
  isActive: user.isActive,
  // Trainer-specific fields
  specialties: user.specialties,
  certifications: user.certifications,
  experience: user.experience,
  availability: user.availability,
  bio: user.bio,
  hourlyRate: user.hourlyRate,
  // Client-specific fields
  address: user.address,
  dogName: user.dogName,
  dogBreed: user.dogBreed,
  dogAge: user.dogAge,
  trainingGoals: user.trainingGoals,
  trainer: user.trainer,
  // Admin fields
  accessLevel: user.accessLevel,
  // Relationships
  clients: user.clients,
  // Timestamps
  created: user.created,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ======================
// Authentication Routes
// ======================

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    const token = await createToken(user);

    res.json({
      token,
      user: formatUserResponse(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(formatUserResponse(user));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================
// Client Registration Routes
// ======================

// @route   POST api/auth/register-client
// @desc    Register a client with dog information
// @access  Public
router.post('/register-client', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      phone,
      address,
      dogName,
      dogBreed,
      dogAge,
      trainingGoals
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({ message: 'Complete address is required' });
    }

    if (!dogName || !dogBreed || !dogAge) {
      return res.status(400).json({ 
        message: 'Dog information (name, breed, age) is required' 
      });
    }

    if (!trainingGoals || trainingGoals.length === 0) {
      return res.status(400).json({ 
        message: 'At least one training goal must be selected' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate username
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new client
    const newClient = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      email: email.toLowerCase().trim(),
      password,
      role: 'client',
      phone: phone.trim(),
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zipCode: address.zipCode.trim()
      },
      dogName: dogName.trim(),
      dogBreed: dogBreed.trim(),
      dogAge: dogAge.trim(),
      trainingGoals,
      isActive: true,
      agreesToTerms: true,
      adminNotes: {
        registrationMethod: 'self'
      }
    });

    await newClient.save();

    // Create JWT token
    const token = await createToken(newClient);

    console.log(`New client registered: ${email}`);

    res.status(201).json({
      message: 'Client registration successful',
      token,
      user: formatUserResponse(newClient)
    });

  } catch (err) {
    console.error('Client registration error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/admin-register-client
// @desc    Admin registers a client manually
// @access  Private (Admin only)
router.post('/admin-register-client', auth, adminAuth, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      phone,
      address,
      dogName,
      dogBreed,
      dogAge,
      sendWelcomeEmail,
      notes
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate username
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new user
    user = new User({
      username,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      address: address ? {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zipCode: address.zipCode?.trim()
      } : undefined,
      role: 'client',
      isActive: true,
      agreesToTerms: true,
      // Store dog info if provided
      dogName: dogName?.trim(),
      dogBreed: dogBreed?.trim(),
      dogAge: dogAge?.trim(),
      // Store admin registration info
      adminNotes: {
        registrationNotes: notes,
        registeredBy: req.user.id,
        registrationMethod: 'admin'
      }
    });

    await user.save();

    // Send welcome email if requested
    if (sendWelcomeEmail && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@puppyprostraining.com',
          to: email,
          subject: 'Welcome to Puppy Pros Training',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Welcome to Puppy Pros Training!</h2>
              <p>Dear ${firstName},</p>
              <p>An account has been created for you by our staff.</p>
              <p><strong>Login Details:</strong></p>
              <p>Email: ${email}</p>
              <p>Temporary Password: ${password}</p>
              <p>Please log in and change your password at your earliest convenience.</p>
              <p>Login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login Here</a></p>
              <p>Best regards,<br>Puppy Pros Training Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Client registered successfully',
      user: {
        id: user.id,
        name: `${firstName} ${lastName}`,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// ======================
// TRAINER INVITE ROUTES (New Secure System)
// ======================

// @route   POST api/auth/send-trainer-invite
// @desc    Send trainer invitation email
// @access  Private/Admin
router.post('/send-trainer-invite', auth, adminAuth, async (req, res) => {
  try {
    const { email, notes } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if there's already a pending invite
    const existingInvite = await TrainerInvite.findOne({ 
      email: email.toLowerCase(), 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Pending invite already exists for this email' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invite
    const invite = new TrainerInvite({
      email: email.toLowerCase(),
      token,
      invitedBy: req.user.id,
      notes
    });

    await invite.save();

    // Send invitation email
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trainer/register/${token}`;
    
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@puppyprostraining.com',
        to: email,
        subject: 'Invitation to Join Puppy Pros Training as a Trainer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">You're Invited to Join Puppy Pros Training!</h2>
            <p>Hello,</p>
            <p>You've been invited to join our team of professional dog trainers at Puppy Pros Training.</p>
            <p>To complete your registration, please click the link below:</p>
            <div style="margin: 20px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Your Registration
              </a>
            </div>
            <p><strong>Note:</strong> This invitation will expire in 7 days.</p>
            ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Puppy Pros Training Team</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              If the button above doesn't work, copy and paste this URL into your browser:<br>
              ${inviteUrl}
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Delete the invite if email failed
      await TrainerInvite.findByIdAndDelete(invite._id);
      return res.status(500).json({ message: 'Failed to send invitation email' });
    }

    res.status(201).json({
      message: 'Trainer invitation sent successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt
      }
    });

  } catch (err) {
    console.error('Error sending trainer invite:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/trainer-invites
// @desc    Get all trainer invitations
// @access  Private/Admin
router.get('/trainer-invites', auth, adminAuth, async (req, res) => {
  try {
    const invites = await TrainerInvite.find({})
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ invites });
  } catch (err) {
    console.error('Error fetching trainer invites:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/resend-trainer-invite/:id
// @desc    Resend trainer invitation
// @access  Private/Admin
router.post('/resend-trainer-invite/:id', auth, adminAuth, async (req, res) => {
  try {
    const invite = await TrainerInvite.findById(req.params.id);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Can only resend pending invitations' });
    }

    // Extend expiration date
    invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await invite.save();

    // Resend email
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trainer/register/${invite.token}`;
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@puppyprostraining.com',
      to: invite.email,
      subject: 'Reminder: Complete Your Trainer Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reminder: Complete Your Trainer Registration</h2>
          <p>Hello,</p>
          <p>This is a reminder that you've been invited to join Puppy Pros Training as a trainer.</p>
          <p>To complete your registration, please click the link below:</p>
          <div style="margin: 20px 0;">
            <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Your Registration
            </a>
          </div>
          <p><strong>Note:</strong> This invitation will expire in 7 days from today.</p>
          <p>Best regards,<br>Puppy Pros Training Team</p>
        </div>
      `,
    });

    res.json({ message: 'Invitation resent successfully' });
  } catch (err) {
    console.error('Error resending trainer invite:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/auth/trainer-invite/:id
// @desc    Revoke trainer invitation
// @access  Private/Admin
router.delete('/trainer-invite/:id', auth, adminAuth, async (req, res) => {
  try {
    const invite = await TrainerInvite.findByIdAndDelete(req.params.id);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    res.json({ message: 'Invitation revoked successfully' });
  } catch (err) {
    console.error('Error revoking trainer invite:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/validate-trainer-invite/:token
// @desc    Validate trainer invitation token
// @access  Public
router.get('/validate-trainer-invite/:token', async (req, res) => {
  try {
    const invite = await TrainerInvite.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired invitation' 
      });
    }

    res.json({
      valid: true,
      email: invite.email,
      expiresAt: invite.expiresAt
    });
  } catch (err) {
    console.error('Error validating trainer invite:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/register-trainer-with-invite
// @desc    Register trainer using invitation token (SECURE)
// @access  Public (but requires valid invite token)
router.post('/register-trainer-with-invite', async (req, res) => {
  try {
    const { 
      token,
      firstName, 
      lastName, 
      phone, 
      password,
      specialties,
      certification,
      experience,
      availability,
      bio,
      hourlyRate
    } = req.body;

    // Validate invitation token
    const invite = await TrainerInvite.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      return res.status(400).json({ message: 'Invalid or expired invitation' });
    }

    // Validate required fields
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, and password are required' 
      });
    }

    if (!specialties || specialties.length === 0) {
      return res.status(400).json({ 
        message: 'At least one specialty is required' 
      });
    }

    if (!certification || !experience || !bio || !hourlyRate) {
      return res.status(400).json({ 
        message: 'All fields are required for trainer registration' 
      });
    }

    if (bio.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Bio must be at least 50 characters long' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const hasAvailability = availability && Object.values(availability).some(day => day === true);
    if (!hasAvailability) {
      return res.status(400).json({ 
        message: 'Please select at least one day of availability' 
      });
    }

    // Check if user already exists (shouldn't happen, but double-check)
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate username
    const baseUsername = invite.email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new trainer
    const newTrainer = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      email: invite.email, // Use email from invitation
      phone: phone?.trim(),
      password,
      role: 'trainer',
      specialties,
      certifications: [certification],
      experience,
      availability,
      bio: bio.trim(),
      hourlyRate: Number(hourlyRate),
      isActive: true,
      agreesToTerms: true,
      adminNotes: {
        registrationMethod: 'invite',
        invitedBy: invite.invitedBy
      }
    });

    await newTrainer.save();

    // Mark invitation as accepted
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    // Create JWT token
    const jwtToken = await createToken(newTrainer);

    console.log(`New trainer registered via invite: ${invite.email}`);

    res.status(201).json({
      message: 'Trainer registration successful',
      token: jwtToken,
      user: formatUserResponse(newTrainer)
    });

  } catch (err) {
    console.error('Trainer registration error:', err);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// ======================
// Admin Dashboard Routes
// ======================

// @route   GET api/auth/clients
// @desc    Get all clients with search and filter
// @access  Private (Admin only)
router.get('/clients', auth, adminAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'client' };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await User.find(query)
      .select('-password')
      .populate('trainer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ clients });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// @route   GET api/auth/trainers
// @desc    Get all trainers
// @access  Private (Admin only)
router.get('/trainers', auth, adminAuth, async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .populate('clients', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
    res.json({ trainers });
  } catch (err) {
    console.error('Error fetching trainers:', err);
    res.status(500).json({ message: 'Failed to fetch trainers' });
  }
});

// ======================
// User Management Routes
// ======================

// @route   GET api/auth/users/:role
// @desc    Get all users by role
// @access  Private (Admin only)
router.get('/users/:role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/user/:userId/toggle-active
// @desc    Toggle user active status
// @access  Private/Admin
router.put('/user/:userId/toggle-active', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================
// Trainer Management Routes
// ======================

// @route   GET api/auth/trainer/:trainerId/clients
// @desc    Get clients assigned to a trainer
// @access  Private
router.get('/trainer/:trainerId/clients', auth, async (req, res) => {
  try {
    const trainer = await User.findById(req.params.trainerId)
      .populate('clients', '-password');
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.json(trainer.clients || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/trainer/:trainerId/assign-client
// @desc    Assign a single client to a trainer
// @access  Private/Admin
router.put('/trainer/:trainerId/assign-client', auth, adminAuth, async (req, res) => {
  try {
    const { clientId } = req.body;
    const { trainerId } = req.params;

    const trainer = await User.findByIdAndUpdate(
      trainerId,
      { $addToSet: { clients: clientId } },
      { new: true }
    );

    const client = await User.findByIdAndUpdate(
      clientId,
      { trainer: trainerId },
      { new: true }
    );

    if (!trainer || !client) {
      return res.status(404).json({ message: 'Trainer or client not found' });
    }

    res.json({ message: 'Client assigned successfully', trainer, client });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/trainer/:trainerId/remove-client
// @desc    Remove a client from a trainer
// @access  Private/Admin
router.put('/trainer/:trainerId/remove-client', auth, adminAuth, async (req, res) => {
  try {
    const { clientId } = req.body;
    const { trainerId } = req.params;

    const trainer = await User.findByIdAndUpdate(
      trainerId,
      { $pull: { clients: clientId } },
      { new: true }
    );

    const client = await User.findByIdAndUpdate(
      clientId,
      { trainer: null },
      { new: true }
    );

    res.json({ message: 'Client removed successfully', trainer, client });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================
// Trainer Notes Routes
// ======================

// @route   POST api/auth/trainer/:trainerId/notes
// @desc    Add a note about a trainer
// @access  Private/Admin
router.post('/trainer/:trainerId/notes', auth, adminAuth, async (req, res) => {
  try {
    const { subject, content, category } = req.body;
    const { trainerId } = req.params;

    const newNote = new TrainerNote({
      trainer: trainerId,
      author: req.user.id,
      subject,
      content,
      category
    });

    await newNote.save();
    await newNote.populate('author', 'firstName lastName');

    res.json(newNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/trainer/:trainerId/notes
// @desc    Get all notes for a trainer
// @access  Private/Admin
router.get('/trainer/:trainerId/notes', auth, adminAuth, async (req, res) => {
  try {
    const notes = await TrainerNote.find({ trainer: req.params.trainerId })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================
// General Registration (Legacy - for backwards compatibility)
// ======================

// @route   POST api/auth/register
// @desc    General registration endpoint (clients only now)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role = 'client' } = req.body;

    // Block trainer registration through this route
    if (role === 'trainer') {
      return res.status(403).json({ 
        message: 'Trainer registration requires an invitation. Please contact an administrator.' 
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username: username || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      role,
      isActive: true,
      adminNotes: {
        registrationMethod: 'self'
      }
    });

    await user.save();

    const token = await createToken(user);

    res.json({
      token,
      user: formatUserResponse(user)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;