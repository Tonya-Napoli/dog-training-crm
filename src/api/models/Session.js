import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  clientPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientPackage',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['individual', 'group', 'evaluation'],
    default: 'individual'
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    default: ''
  },
  goals: {
    type: String
  },
  achievements: {
    type: String
  },
  homework: {
    type: String
  },
  nextSessionGoals: {
    type: String
  },
  progressRating: {
    type: Number,
    min: 1,
    max: 5
  },
  dogBehaviorNotes: {
    type: String
  },
  clientEngagement: {
    type: String
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);