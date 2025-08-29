import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
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
  role: {
    type: String,
    enum: ['trainer', 'admin'],
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  specialties: [String],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  acceptedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for token lookup performance
inviteSchema.index({ token: 1 });
inviteSchema.index({ email: 1 });
inviteSchema.index({ expiresAt: 1 });

export default mongoose.model('Invite', inviteSchema);