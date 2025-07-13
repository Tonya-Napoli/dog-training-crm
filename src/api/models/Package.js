import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sessions: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['puppy', 'basic', 'advanced', 'behavioral', 'specialty'],
    default: 'basic'
  },
  duration: {
    type: Number, // Duration in minutes per session
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Package = mongoose.model('Package', packageSchema);
export default Package;