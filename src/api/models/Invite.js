import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['trainer', 'admin'],
      message: 'Role must be either trainer or admin'
    },
    required: [true, 'Role is required'],
    default: 'trainer'
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
    index: true
  },
  specialties: [{
    type: String,
    enum: {
      values: [
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
        'fearRehabilitation',
        'reactiveDogTraining',
        'puppySocialization',
        'advancedObedience',
        'sportDogTraining'
      ],
      message: 'Invalid specialty selected'
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'expired', 'cancelled'],
      message: 'Status must be pending, accepted, expired, or cancelled'
    },
    default: 'pending',
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    index: true
  },
  acceptedAt: {
    type: Date,
    validate: {
      validator: function(value) {
        // Only validate if acceptedAt is being set
        if (value && this.status !== 'accepted') {
          return false;
        }
        return true;
      },
      message: 'Accepted date can only be set when status is accepted'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  // Tracking fields
  emailSentCount: {
    type: Number,
    default: 1,
    min: [1, 'Email sent count must be at least 1']
  },
  lastEmailSentAt: {
    type: Date,
    default: Date.now
  },
  // Cancellation tracking
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================
// INDEXES
// ============================

// Compound indexes for common queries
inviteSchema.index({ email: 1, status: 1 });
inviteSchema.index({ status: 1, expiresAt: 1 });
inviteSchema.index({ createdBy: 1, status: 1 });
inviteSchema.index({ createdAt: -1 }); // For sorting by newest first

// Text index for searching
inviteSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text' 
});

// ============================
// VIRTUALS
// ============================

// Virtual for full name
inviteSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for checking if expired
inviteSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for days until expiration
inviteSchema.virtual('daysUntilExpiration').get(function() {
  if (this.isExpired) return 0;
  const diffTime = this.expiresAt - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for time since created
inviteSchema.virtual('daysSinceCreated').get(function() {
  const diffTime = new Date() - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted specialties
inviteSchema.virtual('formattedSpecialties').get(function() {
  if (!this.specialties || this.specialties.length === 0) {
    return 'No specialties specified';
  }
  
  return this.specialties.map(specialty => 
    specialty.replace(/([A-Z])/g, ' $1')
             .replace(/^./, str => str.toUpperCase())
             .trim()
  ).join(', ');
});

// Virtual for invite summary
inviteSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    status: this.status,
    isExpired: this.isExpired,
    daysUntilExpiration: this.daysUntilExpiration,
    specialties: this.formattedSpecialties
  };
});

// ============================
// MIDDLEWARE
// ============================

// Pre-save middleware
inviteSchema.pre('save', function(next) {
  // Auto-expire if past expiration date
  if (this.isExpired && this.status === 'pending') {
    this.status = 'expired';
  }
  
  // Set acceptedAt when status changes to accepted
  if (this.isModified('status') && this.status === 'accepted' && !this.acceptedAt) {
    this.acceptedAt = new Date();
  }
  
  // Set cancellation timestamp
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  // Validate that accepted invites have acceptedAt
  if (this.status === 'accepted' && !this.acceptedAt) {
    return next(new Error('Accepted invites must have an accepted date'));
  }
  
  // Validate that cancelled invites have cancellation info
  if (this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Pre-update middleware for findOneAndUpdate operations
inviteSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate();
  
  // Auto-set acceptedAt when status is updated to accepted
  if (update.$set && update.$set.status === 'accepted' && !update.$set.acceptedAt) {
    update.$set.acceptedAt = new Date();
  }
  
  // Auto-set cancelledAt when status is updated to cancelled
  if (update.$set && update.$set.status === 'cancelled' && !update.$set.cancelledAt) {
    update.$set.cancelledAt = new Date();
  }
  
  next();
});

// Post-save middleware for logging
inviteSchema.post('save', function(doc) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[INVITE] ${doc.status.toUpperCase()}: ${doc.fullName} (${doc.email})`);
  }
});

// ============================
// STATIC METHODS
// ============================

// Find active invites (pending and not expired)
inviteSchema.statics.findActive = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

// Find by email with any status
inviteSchema.statics.findByEmail = function(email) {
  return this.find({ email: email.toLowerCase() });
};

// Find expired but still pending
inviteSchema.statics.findExpiredPending = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });
};

// Get invitation statistics
inviteSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Cleanup expired invites
inviteSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { 
        status: 'expired',
        updatedAt: new Date()
      }
    }
  );
};

// ============================
// INSTANCE METHODS
// ============================

// Check if invite can be resent
inviteSchema.methods.canBeResent = function() {
  return this.status === 'pending' && !this.isExpired;
};

// Check if invite can be cancelled
inviteSchema.methods.canBeCancelled = function() {
  return this.status === 'pending';
};

// Extend expiration date
inviteSchema.methods.extendExpiration = function(days = 7) {
  if (this.status !== 'pending') {
    throw new Error('Only pending invites can have their expiration extended');
  }
  
  this.expiresAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
  return this.save();
};

// Mark as resent
inviteSchema.methods.markAsResent = function() {
  this.emailSentCount += 1;
  this.lastEmailSentAt = new Date();
  return this.save();
};

// Cancel with reason
inviteSchema.methods.cancelWithReason = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Accept invite
inviteSchema.methods.accept = function() {
  if (this.isExpired) {
    throw new Error('Cannot accept expired invite');
  }
  
  if (this.status !== 'pending') {
    throw new Error('Only pending invites can be accepted');
  }
  
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Get invite age in days
inviteSchema.methods.getAgeInDays = function() {
  return this.daysSinceCreated;
};

// Check if invite is about to expire (within 24 hours)
inviteSchema.methods.isExpiringSoon = function() {
  return this.daysUntilExpiration <= 1 && !this.isExpired;
};

// ============================
// EXPORT MODEL
// ============================

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;