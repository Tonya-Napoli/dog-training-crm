import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import sgMail from '@sendgrid/mail';

// Setup SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();


// @route   POST api/auth/create-admin
// @desc    Create a new admin account (admin-only)
// @access  Private (Admin only)
router.post('/create-admin', auth, async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      department,
      accessLevel = 'full'
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin user
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      role: 'admin',
      department,
      accessLevel,
      agreesToTerms: true,
      createdBy: req.user.id // Track who created this admin
    });

    await newAdmin.save();

    // Log the admin creation for security audit
    console.log(`New admin account created: ${email} by ${req.user.email || req.user.id}`);

    // Return success without password
    const adminData = newAdmin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: adminData
    });

  } catch (err) {
    console.error('Error creating admin account:', err.message);
    res.status(500).json({ message: 'Server error while creating admin account' });
  }
});

// @route   GET api/auth/admin/users
// @desc    Get all users (admin-only)
// @access  Private (Admin only)
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 10, role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName,
    username, 
    role = 'client',
    phone,
    address,
    dogName,
    dogBreed,
    dogAge,
    trainingGoals,
    specialties,
    certification,
    experience,
    availability,
    bio,
    hourlyRate,
    department,
    accessLevel
  } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username: username || `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      password,
      role // Default is client if not specified
    });
    
    // Add role-specific fields if they exist in your User model
    if (role === 'client' && phone) {
      user.phone = phone;
    }
    if (address) {
      user.address = address;
    }

    // Save user (password will be hashed by pre-save hook)
    await user.save();

    // Send email notification based on role
    try {
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@puppyprostraining.com';
      
      let emailTemplate;
      
      switch(role) {
        case 'client':
          emailTemplate = {
            subject: `New Client Registration: ${firstName || username} ${lastName || ''}`,
            html: `
              <h2>New Client Registration</h2>
              <p><strong>Name:</strong> ${firstName || username} ${lastName || ''}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Dog Information:</strong></p>
              <p>Name: ${dogName || 'Not provided'}</p>
              <p>Breed: ${dogBreed || 'Not provided'}</p>
              <p>Age: ${dogAge || 'Not provided'}</p>
              <p><strong>Training Goals:</strong> ${trainingGoals ? trainingGoals.join(', ') : 'None specified'}</p>
            `
          };
          break;
        case 'trainer':
          emailTemplate = {
            subject: `New Trainer Registration: ${firstName || username} ${lastName || ''}`,
            html: `
              <h2>New Trainer Registration</h2>
              <p><strong>Name:</strong> ${firstName || username} ${lastName || ''}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Certifications:</strong> ${certification || 'Not provided'}</p>
              <p><strong>Experience:</strong> ${experience || 'Not provided'}</p>
              <p><strong>Specialties:</strong> ${specialties ? specialties.join(', ') : 'None specified'}</p>
              <p><strong>Hourly Rate:</strong> $${hourlyRate || 'Not specified'}</p>
              <p><strong>Bio:</strong> ${bio || 'Not provided'}</p>
            `
          };
          break;
        case 'admin':
          emailTemplate = {
            subject: `New Admin Registration: ${firstName || username} ${lastName || ''}`,
            html: `
              <h2>New Admin Registration</h2>
              <p><strong>Name:</strong> ${firstName || username} ${lastName || ''}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Department:</strong> ${department || 'Not specified'}</p>
              <p><strong>Access Level:</strong> ${accessLevel || 'Full'}</p>
            `
          };
          break;
        default:
          emailTemplate = {
            subject: `New User Registration: ${firstName || username} ${lastName || ''}`,
            html: `
              <h2>New User Registration</h2>
              <p><strong>Name:</strong> ${firstName || username} ${lastName || ''}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Role:</strong> ${role}</p>
            `
          };
      }
      
      const msg = {
        to: notificationEmail,
        from: 'notifications@puppyprostraining.com', // Change to your verified sender
        subject: emailTemplate.subject,
        html: emailTemplate.html
      };

      await sgMail.send(msg);
      console.log(`Notification email sent for ${role} registration`);
    } catch (emailError) {
      // Log the error but don't fail the registration
      console.error('Email notification error:', emailError);
    }

    // Create JWT token
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
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );
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
    // Get user data by ID (excluding password)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;