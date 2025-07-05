// src/api/models/User.js - Enhanced User model
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  adminNotes: {
    registrationNotes: String,
    registeredBy: {  // Also fixed typo: was "registerBy", should be "registeredBy"
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationMethod: {
      type: String,
      enum: ['self', 'admin', 'import'],
      default: 'self'
    }
  }, // <-- This closing brace was missing!
  
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    sparse: true, // Changed from required: true to sparse: true to allow null values
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'trainer', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  profileImage: String,
  
  // Trainer-specific fields
  specialties: [{
    type: String,
    enum: [
      'basicObedience',
      'puppyTraining', 
      'behaviorModification',
      'aggressionManagement',
      'anxietyReduction',
      'serviceAnimal',
      'leashManners',
      'houseTraining',
      'socialization',
      'tricks',
      'agilityTraining',
      'therapyDog',
      'competitionTraining',
      'searchAndRescue',
      'protectionTraining',
      'fearRehabilitation', // Fixed typo: was "fearRehabiliation"
      'reactiveDogTraining', // Fixed typo: was "reactiveeDogTraining"
      'puppySocialization',
      'advancedObedience',
      'sportDogTraining'
    ]
  }],
  certifications: [String],
  experience: {
    type: String,
    enum: ['1-2 years', '3-5 years', '5-10 years', '10+ years']
  },
  availability: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  bio: String,
  hourlyRate: Number,
  
  // Client-specific fields
  dogName: String,
  dogBreed: String,
  dogAge: String,
  trainingGoals: [{
    type: String,
    enum: [
      'basicObedience',
      'leashManners',
      'houseTraining',
      'socialization',
      'behaviorModification', 
      'tricks',
      'agilityTraining',
      'puppyTraining',
      'advancedObedience',
      'reactiveDogTraining', // Fixed typo
      'fearRehabilitation', // Fixed typo
      'aggressionManagement',
      'anxietyReduction'
    ]
  }],
  
  // Client-trainer relationship
  trainer: { // Changed from "assignedTrainer" to "trainer" to match your routes
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // For trainers: their clients
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Admin fields
  accessLevel: {
    type: String,
    enum: ['full', 'limited', 'readonly'],
    default: 'full'
  },
  
  //
  isActive: {
    type: Boolean,
    default: true
  },
  
  agreesToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  lastLogin: Date,
  created: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);


export default User;