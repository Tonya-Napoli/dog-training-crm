import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth, { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper function to create JWT token
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

// Helper function to format user response
const formatUserResponse = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isActive: user.isActive
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account has been deactivated. Please contact support.' 
      });
    }

    // Verify password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await user.updateLastLogin();

    // Create JWT token
    const token = await createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/register-client
// @desc    Register a client with dog information and training goals
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
      return res.status(400).json({ 
        message: 'Phone number is required' 
      });
    }

    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({ 
        message: 'Complete address is required' 
      });
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

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new client
    const newClient = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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
      isActive: true,
      agreesToTerms: true
    });

    await newClient.save();

    // Create JWT token
    const token = await createToken(newClient);

    // Log registration for audit
    console.log(`New client registered: ${email} - Dog: ${dogName} (${dogBreed})`);
    console.log(`Training goals: ${trainingGoals.join(', ')}`);

    res.status(201).json({
      message: 'Client registration successful',
      token,
      user: formatUserResponse(newClient),
      dogInfo: {
        name: dogName,
        breed: dogBreed,
        age: dogAge,
        trainingGoals
      }
    });

  } catch (err) {
    console.error('Client registration error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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

    // Validate availability (at least one day selected)
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

    // Create new trainer
    const newTrainer = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
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

    // Log registration for audit
    console.log(`New trainer registered: ${email}`);
    console.log(`Specialties: ${specialties.join(', ')}`);
    console.log(`Experience: ${experience}, Rate: $${hourlyRate}/hr`);

    res.status(201).json({
      message: 'Trainer registration successful',
      token,
      user: formatUserResponse(newTrainer)
    });

  } catch (err) {
    console.error('Trainer registration error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/create-admin
// @desc    Create a new admin account (admin-only)
// @access  Private (Admin only)
router.post('/create-admin', adminAuth, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      accessLevel = 'full'
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Validate access level
    if (!['full', 'limited', 'readonly'].includes(accessLevel)) {
      return res.status(400).json({ 
        message: 'Invalid access level' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin user
    const newAdmin = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      accessLevel,
      agreesToTerms: true,
      createdBy: req.user.id,
      isActive: true
    });

    await newAdmin.save();

    // Log the admin creation for security audit
    console.log(`New admin account created: ${email} by ${req.user.email || req.user.id}`);

    // Return success without password
    res.status(201).json({
      message: 'Admin account created successfully',
      admin: formatUserResponse(newAdmin)
    });

  } catch (err) {
    console.error('Error creating admin account:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating admin account',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Get user data by ID (excluding password) - fresh from database
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account has been deactivated' 
      });
    }

    res.json(formatUserResponse(user));
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      message: 'Server error while fetching user data',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   GET api/auth/admin/users
// @desc    Get all users (admin-only)
// @access  Private (Admin only)
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Build query
    let query = {};
    if (role && ['client', 'trainer', 'admin'].includes(role)) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(formatUserResponse),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   PUT api/auth/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/admin/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: 'isActive must be true or false' 
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user.id && !isActive) {
      return res.status(400).json({ 
        message: 'You cannot deactivate your own account' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the status change
    console.log(`User ${user.email} ${isActive ? 'activated' : 'deactivated'} by ${req.user.email || req.user.id}`);

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: formatUserResponse(user)
    });

  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ 
      message: 'Server error while updating user status',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', auth, async (req, res) => {
  try {
    // Create new token
    const token = await createToken(req.user);
    
    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ 
      message: 'Server error while refreshing token',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // In a stateless JWT implementation, logout is handled client-side
  // But we can log it for audit purposes
  console.log(`User ${req.user.email || req.user.id} logged out`);
  
  res.json({ message: 'Logged out successfully' });
});

export default router;