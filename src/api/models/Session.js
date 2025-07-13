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
    required: true,
    default: Date.now
  },
  duration: {
    type: Number, // Duration in minutes
    default: 60
  },
  sessionType: {
    type: String,
    enum: ['individual', 'group', 'assessment', 'followup'],
    default: 'individual'
  },
  notes: {
    type: String // Trainer notes about the session
  },
  goals: [String], // Goals worked on during session
  achievements: [String], // What the dog/client achieved
  homework: {
    type: String // Homework assigned for next session
  },
  nextSessionGoals: [String], // Goals for next session
  status: {
    type: String,
    enum: ['completed', 'missed', 'cancelled', 'rescheduled'],
    default: 'completed'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;