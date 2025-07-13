import mongoose from 'mongoose';

const clientPackageSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  sessionsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active'
  },
  expirationDate: {
    type: Date // Optional expiration date for packages
  },
  notes: {
    type: String // Admin notes about the package assignment
  },
  lastSessionDate: {
    type: Date
  },
  nextSessionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual to calculate sessions remaining
clientPackageSchema.virtual('sessionsRemaining').get(function() {
  return Math.max(0, this.package.sessions - this.sessionsUsed);
});

// Virtual to calculate progress percentage
clientPackageSchema.virtual('progressPercentage').get(function() {
  if (!this.package.sessions) return 0;
  return Math.round((this.sessionsUsed / this.package.sessions) * 100);
});

clientPackageSchema.set('toJSON', { virtuals: true });
clientPackageSchema.set('toObject', { virtuals: true });

const ClientPackage = mongoose.model('ClientPackage', clientPackageSchema);
export default ClientPackage;