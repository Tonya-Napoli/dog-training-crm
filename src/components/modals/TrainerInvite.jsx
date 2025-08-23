// src/api/models/TrainerInvite.js
import mongoose from 'mongoose';

const trainerInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  acceptedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { 
  timestamps: true 
});

// Index for cleanup of expired invites
trainerInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TrainerInvite = mongoose.model('TrainerInvite', trainerInviteSchema);

export default TrainerInvite;