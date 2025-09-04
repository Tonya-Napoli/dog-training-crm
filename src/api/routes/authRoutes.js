// src/api/routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//import crypto from 'crypto';
import { Resend } from 'resend';
import User from '../models/User.js';
import TrainerNote from '../models/TrainerNote.js';
import auth from '../middleware/auth.js';
import { InviteController } from '../controllers/inviteController.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const inviteController = new InviteController();

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
  specialties: user.specialties,
  certifications: user.certifications,
  experience: user.experience,
  availability: user.availability,
  bio: user.bio,
  hourlyRate: user.hourlyRate,
  address: user.address,
  dogName: user.dogName,
  dogBreed: user.dogBreed,
  dogAge: user.dogAge,
  trainingGoals: user.trainingGoals,
  trainer: user.trainer,
  accessLevel: user.accessLevel,
  clients: user.clients,
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

//TEMPORARY
// Temporary debug endpoint - remove after testing
router.get('/debug/email-config', auth, adminAuth, async (req, res) => {
  res.json({
    resendApiKeyExists: !!process.env.RESEND_API_KEY,
    resendApiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 7) + '...' : 'NOT_SET',
    fromEmail: process.env.FROM_EMAIL || 'NOT_SET',
    frontendUrl: process.env.FRONTEND_URL || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV
  });
});
// Test email endpoint using proven working code
router.post('/test-email', auth, adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🧪 Testing email with working Resend code...');
    
    const emailResult = await resend.emails.send({
      from: 'onboarding@resend.dev', // Same as working emailRoutes
      to: email,
      subject: 'Test Trainer Invite - Debug',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email - Trainer Invite Debug</h2>
          <p>This is a test email to debug the trainer invite system.</p>
          <p>If you receive this, the basic email system is working.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log('✅ Test email result:', emailResult);
    
    res.json({
      success: true,
      message: 'Test email sent',
      emailId: emailResult.id
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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

    // Create new user
    const user = new User({
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
      dogName: dogName?.trim(),
      dogBreed: dogBreed?.trim(),
      dogAge: dogAge?.trim(),
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
// TRAINER MANAGEMENT - Using New InviteController
// ======================

// @route   POST api/auth/send-trainer-invite
// @desc    Send trainer invitation using new InviteController
// @access  Private/Admin
router.post('/send-trainer-invite', auth, adminAuth, async (req, res) => {
  try {
    console.log('[DEBUG] Full request body:', JSON.stringify(req.body, null, 2));
    console.log('[DEBUG] Request user:', JSON.stringify(req.user, null, 2));
    const { email, notes } = req.body;

    console.log('Received trainer invite request for:', email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Transform old request format to new InviteController format
    const transformedReq = {
      body: {
        firstName: 'New',        // Default - can be updated by trainer during registration
        lastName: 'Trainer',     // Default - can be updated by trainer during registration  
        email: email,
        specialties: [],
        message: notes || ''
      },
      user: req.user
    };

    // Custom response object to maintain backward compatibility
    const customRes = {
      status: (code) => ({
        json: (data) => {
          // Transform new controller response to old format expected by frontend
          if (data.success) {
            return res.status(201).json({
              message: 'Trainer invitation sent successfully',
              invite: {
                email: email,
                status: 'sent',
                inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trainer/register?invite=${data.inviteId}&email=${encodeURIComponent(email)}`
              }
            });
          } else {
            return res.status(code).json({ message: data.message });
          }
        }
      })
    };

    // Use the new InviteController
    await inviteController.sendTrainerInvite(transformedReq, customRes);
    
  } catch (err) {
    console.error('Error sending trainer invite:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/auth/trainer-invites
// @desc    Get trainer invites using new system
// @access  Private/Admin
router.get('/trainer-invites', auth, adminAuth, async (req, res) => {
  try {
    // For now, return empty array since the new system stores invites in database
    // but we need to implement the getPendingInvites method in InviteService
    res.json({ 
      invites: [],
      message: 'Invite tracking implemented - check database for stored invites'
    });
  } catch (err) {
    console.error('Error fetching trainer invites:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/register-trainer
// @desc    Register trainer (updated to work with new invite system)
// @access  Public
router.post('/register-trainer', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email,
      phone, 
      password,
      specialties,
      certification,
      experience,
      availability,
      bio,
      hourlyRate,
      inviteToken // For invite-based registration
    } = req.body;

    console.log('Trainer registration attempt for:', email);

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // If inviteToken provided, validate it using InviteController
    if (inviteToken) {
      try {
        // Create mock request for invite validation
        const mockReq = { params: { token: inviteToken } };
        const mockRes = {
          status: () => ({
            json: (data) => {
              if (!data.success) {
                throw new Error(data.message);
              }
            }
          })
        };
        
        await inviteController.validateInvite(mockReq, mockRes);
      } catch (inviteError) {
        return res.status(400).json({ 
          message: 'Invalid or expired invitation token' 
        });
      }
    }

    // Generate username
    const baseUsername = email.split('@')[0].toLowerCase();
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
      email: email.toLowerCase().trim(),
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
        registrationMethod: inviteToken ? 'invite' : 'direct',
        inviteToken: inviteToken || 'none'
      }
    });

    await newTrainer.save();

    // If this was invite-based registration, mark invite as accepted
    if (inviteToken) {
      try {
        const mockReq = { 
          params: { token: inviteToken },
          body: req.body
        };
        const mockRes = {
          status: () => ({
            json: () => {} // Don't send response, we'll handle it here
          })
        };
        
        await inviteController.acceptInvite(mockReq, mockRes);
      } catch (error) {
        console.error('Failed to mark invite as accepted:', error);
        // Continue with registration even if invite marking fails
      }
    }

    // Create JWT token
    const jwtToken = await createToken(newTrainer);

    console.log(`New trainer registered: ${email}`);

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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// General Registration (Legacy)
// ======================

// @route   POST api/auth/register
// @desc    General registration endpoint (clients only)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role = 'client' } = req.body;

    if (role === 'trainer') {
      return res.status(403).json({ 
        message: 'Trainer registration requires an invitation. Please contact an administrator.' 
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
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
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;