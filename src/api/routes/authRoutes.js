import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

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
  _id: user._id, // Include both for compatibility
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
  assignedTrainer: user.assignedTrainer,
  // Timestamps
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
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

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

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

    // Generate username
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username: username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new trainer
    const newTrainer = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username,
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
    console.log(`Experience: ${experience}, Rate: ${hourlyRate}/hr`);

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

    // Generate username
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username: username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new client
    const newClient = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username,
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
      trainingGoals: trainingGoals,
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

// @route   POST api/auth/register
// @desc    General registration endpoint (maintains compatibility)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      role = 'client',
      username,
      agreesToTerms = true
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

    // Generate username if not provided
    let finalUsername = username;
    if (!finalUsername) {
      const baseUsername = email.split('@')[0].toLowerCase();
      finalUsername = baseUsername;
      let counter = 1;
      
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }
    }

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: finalUsername,
      email: email.toLowerCase().trim(),
      password,
      role,
      agreesToTerms,
      isActive: true
    });

    await newUser.save();

    // Create JWT token
    const token = await createToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: formatUserResponse(newUser)
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email or username already registered' 
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
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
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/users/:role
// @desc    Get all users by role
// @access  Private (Admin only)
router.get('/users/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/users/:role
// @desc    Get all users by role
// @access  Private (Admin only)
router.get('/users/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/users', auth, async (req, res) => {
  try {
    const { role, search } = req.query;
    
    // Build query
    let query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users (excluding passwords)
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/users/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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
    
    res.json(trainer.clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/users/:id/status
// @desc    Update user active status (admin only)
// @access  Private (Admin)
router.put('/users/:id/status', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
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

// @route   GET api/auth/users
// @desc    Get users by role (for admin dashboard)
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 100 } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by role if specified
    if (role && ['client', 'trainer', 'admin'].includes(role)) {
      query.role = role;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch users with populated trainer info for clients
    const users = await User.find(query)
      .select('-password')
      .populate('assignedTrainer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(formatUserResponse),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   PUT api/auth/users/:id/assign-trainer
// @desc    Assign a trainer to a client
// @access  Private (Admin only)
router.put('/users/:id/assign-trainer', adminAuth, async (req, res) => {
  try {
    const { trainerId } = req.body;
    const clientId = req.params.id;

    // Validate that the client exists and is a client
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.role !== 'client') {
      return res.status(400).json({ message: 'User is not a client' });
    }

    // If trainerId is provided, validate that the trainer exists and is a trainer
    if (trainerId) {
      const trainer = await User.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      if (trainer.role !== 'trainer') {
        return res.status(400).json({ message: 'User is not a trainer' });
      }

      if (!trainer.isActive) {
        return res.status(400).json({ message: 'Trainer is not active' });
      }
    }

    // Update the client's assigned trainer
    const updatedClient = await User.findByIdAndUpdate(
      clientId,
      { 
        assignedTrainer: trainerId || null,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTrainer', 'firstName lastName email');

    // Log the assignment
    if (trainerId) {
      console.log(`Client ${client.email} assigned to trainer ${trainerId} by admin ${req.user.email}`);
    } else {
      console.log(`Client ${client.email} unassigned from trainer by admin ${req.user.email}`);
    }

    res.json({
      message: trainerId ? 'Trainer assigned successfully' : 'Trainer unassigned successfully',
      client: formatUserResponse(updatedClient)
    });

  } catch (err) {
    console.error('Error assigning trainer:', err);
    res.status(500).json({ 
      message: 'Server error while assigning trainer',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   PUT api/auth/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
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
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User ${user.email} ${isActive ? 'activated' : 'deactivated'} by admin ${req.user.email}`);

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

// @route   POST api/auth/create-admin
// @desc    Create a new admin account (admin-only) - for CreateAdminForm
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate username
    const baseUsername = 'admin';
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username: username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create new admin user
    const newAdmin = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      accessLevel,
      agreesToTerms: true,
      isActive: true
    });

    await newAdmin.save();

    console.log(`New admin account created: ${email} by ${req.user.email}`);

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: formatUserResponse(newAdmin)
    });

  } catch (err) {
    console.error('Error creating admin account:', err);
    
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

// @route   GET api/auth/trainers
// @desc    Get all trainers with client assignments
// @access  Private (Admin only)
router.get('/trainers', adminAuth, async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get client counts for each trainer
    const trainersWithStats = await Promise.all(
      trainers.map(async (trainer) => {
        const clientCount = await User.countDocuments({ 
          role: 'client', 
          assignedTrainer: trainer._id 
        });
        
        return {
          ...formatUserResponse(trainer),
          clientCount
        };
      })
    );

    res.json({
      trainers: trainersWithStats,
      total: trainers.length
    });

  } catch (err) {
    console.error('Error fetching trainers:', err);
    res.status(500).json({ 
      message: 'Server error while fetching trainers',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   GET api/auth/clients
// @desc    Get all clients with trainer assignments
// @access  Private (Admin only)
router.get('/clients', adminAuth, async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .populate('assignedTrainer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      clients: clients.map(formatUserResponse),
      total: clients.length
    });

  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ 
      message: 'Server error while fetching clients',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  console.log(`User logged out`);
  res.json({ message: 'Logged out successfully' });
});

export default router;