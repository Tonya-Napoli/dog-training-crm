// src/api/models/dogModel.js
import mongoose from 'mongoose';

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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    specialNeeds: String
  },
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