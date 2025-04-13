// src/api/models/dogModel.js
import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  dateAdministered: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date
  },
  recordImage: {
    type: String  // URL to uploaded image
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  notes: String
});

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  weight: {
    type: Number  // in pounds
  },
  birthday: {
    type: Date
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaccinations: [vaccinationSchema],
  isNeutered: {
    type: Boolean,
    default: false
  },
  trainingProgress: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    notes: String,
    completedOn: {
      type: Date,
      default: Date.now
    }
  }],
  trainingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingPlan'
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    specialNeeds: String,
    veterinarian: {
      name: String,
      phone: String,
      address: String
    }
  },
  profileImage: String,
  created: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Dog = mongoose.model('Dog', dogSchema);

export default Dog;