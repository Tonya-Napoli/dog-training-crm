// src/api/models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
  dogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog'
  }],
  // Fields specific to trainers (we'll keep these for later)
  certifications: [String],
  specialties: [String],
  // For clients: their assigned trainer
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For trainers: their clients
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  agreesToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
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