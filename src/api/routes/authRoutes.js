import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
//import auth from '../middleware/auth.js';
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
      agreesToTerms: true
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
      agreesToTerms: true
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
      role
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
router.get('/user', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
router.get('/trainer/:trainerId/clients', adminAuth, async (req, res) => {
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
// @desc    Assign a client to a trainer
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