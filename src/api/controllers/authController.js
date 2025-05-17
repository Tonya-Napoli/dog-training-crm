import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

// Setup SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Register a new user (client, trainer, or admin)
export const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
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
      accessLevel,
      emergencyContact,
      agreesToTerms = true
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      role,
      phone,
      address
    });

    // Add role-specific fields
    if (role === 'client') {
      // Add client-specific fields
      newUser.dogs = []; // Will create dog record separately
    } else if (role === 'trainer') {
      // Add trainer-specific fields
      newUser.certifications = specialties || [];
      newUser.specialties = specialties || [];
      newUser.availabilitySchedule = availability;
      newUser.profile = { bio, hourlyRate };
    } else if (role === 'admin') {
      // Add admin-specific fields
      newUser.department = department;
      newUser.accessLevel = accessLevel;
    }

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send email notification based on role
    try {
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@puppyprostraining.com';
      
      let emailTemplate;
      
      switch(role) {
        case 'client':
          emailTemplate = {
            subject: `New Client Registration: ${firstName} ${lastName}`,
            html: `
              <h2>New Client Registration</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
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
            subject: `New Trainer Registration: ${firstName} ${lastName}`,
            html: `
              <h2>New Trainer Registration</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
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
            subject: `New Admin Registration: ${firstName} ${lastName}`,
            html: `
              <h2>New Admin Registration</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Department:</strong> ${department || 'Not specified'}</p>
              <p><strong>Access Level:</strong> ${accessLevel || 'Full'}</p>
            `
          };
          break;
        default:
          emailTemplate = {
            subject: `New User Registration: ${firstName} ${lastName}`,
            html: `
              <h2>New User Registration</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
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

    // Return user data without password
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
};