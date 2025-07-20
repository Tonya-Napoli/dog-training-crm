import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import TrainerNote from '../models/TrainerNote.js';

const router = express.Router();

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
// Registration Routes
// ======================

// @route   POST api/auth/admin-register-client
// @desc    Admin registers a client manually
// @access  Private (Admin only)
router.post('/admin-register-client', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

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
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    user = new User({
      username: email.split('@')[0],
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role: 'client',
      isActive: true,
      agreesToTerms: true,
      // Store dog info if provided
      dogName,
      dogBreed,
      dogAge,
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
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'info@puppyprostraining.com',
      to: email,
      subject: 'Welcome to Puppy Pros Training',
      html: `
        <h2>Welcome to Puppy Pros Training!</h2>
        <p>Dear ${firstName},</p>
        <p>An account has been created for you by our staff.</p>
        <p><strong>Login Details:</strong></p>
        <p>Email: ${email}</p>
        <p>Temporary Password: ${password}</p>
        <p>Please log in and change your password at your earliest convenience.</p>
        <p>Login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login Here</a></p>
        <p>Best regards,<br>Puppy Pros Training Team</p>
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

// @route   POST api/auth/register-trainer
// @desc    Register a trainer with all trainer-specific fields
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
      hourlyRate
    } = req.body;

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

    if (!certification) {
      return res.status(400).json({ 
        message: 'Certification is required' 
      });
    }

    if (!experience) {
      return res.status(400).json({ 
        message: 'Experience level is required' 
      });
    }

    if (!bio || bio.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Bio must be at least 50 characters long' 
      });
    }

    if (!hourlyRate || isNaN(hourlyRate) || Number(hourlyRate) <= 0) {
      return res.status(400).json({ 
        message: 'Valid hourly rate is required' 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Validate availability
    const hasAvailability = availability && Object.values(availability).some(day => day === true);
    if (!hasAvailability) {
      return res.status(400).json({ 
        message: 'Please select at least one day of availability' 
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
        registrationMethod: 'self'
      }
    });

    await newTrainer.save();

    // Create JWT token
    const token = await createToken(newTrainer);

    console.log(`New trainer registered: ${email}`);

    res.status(201).json({
      message: 'Trainer registration successful',
      token,
      user: formatUserResponse(newTrainer)
    });

  } catch (err) {
    console.error('Trainer registration error:', err);
    
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

// @route   POST api/auth/register
// @desc    General registration endpoint
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role = 'client' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username: username || email.split('@')[0],
      email,
      password,
      role,
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

// ======================
// Authentication Routes
// ======================

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = await createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username || `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================
// Admin Dashboard Routes
// ======================

// @route   GET api/auth/clients
// @desc    Get all clients with search and filter
// @access  Private (Admin only)
router.get('/clients', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

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
      .sort({ created: -1 });

    res.json({ clients });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// @route   GET api/auth/trainers
// @desc    Get all trainers
// @access  Private (Admin only)
router.get('/trainers', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .populate('clients', 'firstName lastName email')
      .sort({ created: -1 });
      
    res.json({ trainers });
  } catch (err) {
    console.error('Error fetching trainers:', err);
    res.status(500).json({ message: 'Failed to fetch trainers' });
  }
});

// @route   PUT api/auth/trainer/:id/status
// @desc    Update trainer active status
// @access  Private (Admin only)
router.put('/trainer/:id/status', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { isActive } = req.body;
    
    // Find trainer and update status
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    trainer.isActive = isActive;
    await trainer.save();

    res.json({ 
      message: 'Trainer status updated successfully',
      trainer: {
        id: trainer._id,
        isActive: trainer.isActive
      }
    });
  } catch (err) {
    console.error('Error updating trainer status:', err);
    res.status(500).json({ message: 'Failed to update trainer status' });
  }
});

// @route   PUT api/auth/trainer/:id/assign-clients
// @desc    Assign multiple clients to a trainer
// @access  Private (Admin only)
router.put('/trainer/:id/assign-clients', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { clientIds } = req.body;
    const trainerId = req.params.id;

    // Verify trainer exists
    const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Remove trainer from all clients first
    await User.updateMany(
      { role: 'client', trainer: trainerId },
      { $unset: { trainer: 1 } }
    );

    // Assign new clients to trainer
    if (clientIds && clientIds.length > 0) {
      await User.updateMany(
        { _id: { $in: clientIds }, role: 'client' },
        { trainer: trainerId }
      );

      // Update trainer's client list
      trainer.clients = clientIds;
      await trainer.save();
    } else {
      // If no clients selected, clear trainer's client list
      trainer.clients = [];
      await trainer.save();
    }

    res.json({ message: 'Clients assigned successfully' });
  } catch (err) {
    console.error('Error assigning clients:', err);
    res.status(500).json({ message: 'Failed to assign clients' });
  }
});

// ======================
// User Management Routes
// ======================

// @route   GET api/auth/users/:role
// @desc    Get all users by role
// @access  Private (Admin only)
router.get('/users/:role', adminAuth, async (req, res) => {
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
router.put('/user/:userId/toggle-active', adminAuth, async (req, res) => {
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
router.put('/trainer/:trainerId/assign-client', adminAuth, async (req, res) => {
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
router.put('/trainer/:trainerId/remove-client', adminAuth, async (req, res) => {
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
router.post('/trainer/:trainerId/notes', adminAuth, async (req, res) => {
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

    await User.findByIdAndUpdate(trainerId, {
      $push: { adminNotes: newNote._id }
    });

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
router.get('/trainer/:trainerId/notes', adminAuth, async (req, res) => {
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

export default router;