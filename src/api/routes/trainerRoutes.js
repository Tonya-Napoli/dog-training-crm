// src/api/routes/trainerRoutes.js
import express from 'express';
import Trainer from '../models/Trainer.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads/trainers')) {
      fs.mkdirSync('uploads/trainers', { recursive: true });
    }
    cb(null, 'uploads/trainers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Register a new trainer
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, specialties,
      certification, experience, availability, bio, hourlyRate, isActive 
    } = req.body;
    
    // Check if trainer with this email already exists
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ message: 'Trainer with this email already exists' });
    }
    
    // Parse availability JSON if it's a string
    let parsedAvailability = availability;
    if (typeof availability === 'string') {
      try {
        parsedAvailability = JSON.parse(availability);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid availability format' });
      }
    }

    // Parse specialties array if it's a string
    let parsedSpecialties = specialties;
    if (typeof specialties === 'string') {
      try {
        parsedSpecialties = JSON.parse(specialties);
      } catch (error) {
        // If it's a comma-separated string
        parsedSpecialties = specialties.split(',').map(s => s.trim());
      }
    }
    
    // Create new trainer
    const newTrainer = new Trainer({
      firstName,
      lastName,
      email,
      password,
      specialties: parsedSpecialties,
      certification,
      experience,
      availability: parsedAvailability,
      bio,
      hourlyRate: parseFloat(hourlyRate),
      isActive: isActive === 'true' || isActive === true
    });
    
    // Add profile image if uploaded
    if (req.file) {
      newTrainer.profileImage = `/uploads/trainers/${req.file.filename}`;
    }
    
    await newTrainer.save();
    
    res.status(201).json({
      message: 'Trainer registered successfully',
      trainer: {
        id: newTrainer._id,
        firstName: newTrainer.firstName,
        lastName: newTrainer.lastName,
        email: newTrainer.email,
        specialties: newTrainer.specialties,
        experience: newTrainer.experience,
        hourlyRate: newTrainer.hourlyRate
      }
    });
  } catch (error) {
    console.error('Error registering trainer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all trainers (public)
router.get('/', async (req, res) => {
  try {
    const { specialties, experience, sort, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = { isActive: true };
    
    if (specialties) {
      query.specialties = { $in: specialties.split(',') };
    }
    
    if (experience) {
      query.experience = experience;
    }
    
    // Build sort options
    let sortOptions = {};
    if (sort === 'rating') {
      sortOptions.averageRating = -1;
    } else if (sort === 'price-low') {
      sortOptions.hourlyRate = 1;
    } else if (sort === 'price-high') {
      sortOptions.hourlyRate = -1;
    } else {
      sortOptions.createdAt = -1; // Default newest first
    }
    
    const trainers = await Trainer.find(query)
      .select('firstName lastName specialties certification experience bio hourlyRate averageRating profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Trainer.countDocuments(query);
    
    res.status(200).json({ 
      trainers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific trainer by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select('-password')
      .populate('clients', 'firstName lastName');
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.status(200).json(trainer);
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update trainer profile (protected)
router.put('/:id', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Only trainer themselves or admin can update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { 
      firstName, lastName, email, specialties,
      certification, experience, availability, bio, hourlyRate, isActive 
    } = req.body;
    
    // Parse availability and specialties if they're strings
    let updateData = {
      firstName, lastName, email, certification, experience, bio,
      updatedAt: Date.now()
    };
    
    if (hourlyRate) {
      updateData.hourlyRate = parseFloat(hourlyRate);
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true;
    }
    
    if (specialties) {
      let parsedSpecialties = specialties;
      if (typeof specialties === 'string') {
        try {
          parsedSpecialties = JSON.parse(specialties);
        } catch (error) {
          parsedSpecialties = specialties.split(',').map(s => s.trim());
        }
      }
      updateData.specialties = parsedSpecialties;
    }
    
    if (availability) {
      let parsedAvailability = availability;
      if (typeof availability === 'string') {
        try {
          parsedAvailability = JSON.parse(availability);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid availability format' });
        }
      }
      updateData.availability = parsedAvailability;
    }
    
    // Add profile image if uploaded
    if (req.file) {
      updateData.profileImage = `/uploads/trainers/${req.file.filename}`;
      
      // Remove old profile image if exists
      const trainer = await Trainer.findById(req.params.id);
      if (trainer.profileImage) {
        const oldImagePath = path.join(__dirname, '../../../', trainer.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedTrainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.status(200).json(updatedTrainer);
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete trainer (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    // Remove profile image if exists
    if (trainer.profileImage) {
      const imagePath = path.join(__dirname, '../../../', trainer.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add rating for a trainer
router.post('/:id/ratings', auth, async (req, res) => {
  try {
    // Only clients can add ratings
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can add ratings' });
    }
    
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    // Check if user has already rated this trainer
    const existingRatingIndex = trainer.ratings.findIndex(
      r => r.clientId.toString() === req.user.id
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      trainer.ratings[existingRatingIndex] = {
        clientId: req.user.id,
        rating: parseInt(rating),
        comment,
        date: Date.now()
      };
    } else {
      // Add new rating
      trainer.ratings.push({
        clientId: req.user.id,
        rating: parseInt(rating),
        comment,
        date: Date.now()
      });
    }
    
    await trainer.save();
    
    res.status(201).json({ message: 'Rating added successfully', averageRating: trainer.averageRating });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;