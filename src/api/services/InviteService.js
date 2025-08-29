// src/api/services/InviteService.js
import crypto from 'crypto';
import { ValidationError } from '../utils/errors.js';
import Invite from '../models/Invite.js';

export class InviteService {
  async createTrainerInvite(inviteData) {
    const token = this.generateInviteToken();
    const expiresAt = this.calculateExpirationDate();
    
    // Check if there's already a pending invite for this email
    const existingInvite = await Invite.findOne({ 
      email: inviteData.email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      throw new ValidationError('An active invite already exists for this email');
    }

    const invite = new Invite({
      email: inviteData.email.toLowerCase(),
      firstName: inviteData.firstName,
      lastName: inviteData.lastName,
      role: 'trainer',
      token,
      expiresAt,
      specialties: inviteData.specialties || [],
      status: 'pending',
      createdBy: inviteData.adminId,
      // Only add message if your model has it
      ...(inviteData.message && { message: inviteData.message })
    });

    await invite.save();
    return invite;
  }

  generateInviteToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  calculateExpirationDate() {
    const expirationDays = parseInt(process.env.INVITE_EXPIRATION_DAYS) || 7;
    return new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000));
  }

  async validateInvite(token) {
    const invite = await Invite.findOne({ 
      token, 
      status: 'pending'
    }).populate('createdBy', 'firstName lastName email');

    if (!invite) {
      throw new ValidationError('Invalid invite token');
    }

    // Check if expired (using manual check since virtual might not be available)
    const isExpired = new Date() > invite.expiresAt;
    
    if (isExpired) {
      // Mark as expired
      invite.status = 'expired';
      await invite.save();
      throw new ValidationError('This invite has expired');
    }

    return invite;
  }

  async markInviteAsUsed(inviteId) {
    const invite = await Invite.findByIdAndUpdate(
      inviteId, 
      { 
        status: 'accepted', 
        acceptedAt: new Date() 
      },
      { new: true }
    );

    if (!invite) {
      throw new ValidationError('Invite not found');
    }

    return invite;
  }

  async cancelInvite(inviteId, adminId) {
    const invite = await Invite.findById(inviteId);
    
    if (!invite) {
      throw new ValidationError('Invite not found');
    }

    if (invite.status !== 'pending') {
      throw new ValidationError('Only pending invites can be cancelled');
    }

    invite.status = 'cancelled';
    await invite.save();
    
    return invite;
  }

  async resendInvite(inviteId) {
    const invite = await Invite.findById(inviteId);
    
    if (!invite) {
      throw new ValidationError('Invite not found');
    }

    if (invite.status !== 'pending') {
      throw new ValidationError('Only pending invites can be resent');
    }

    // Extend expiration date
    invite.expiresAt = this.calculateExpirationDate();
    await invite.save();
    
    return invite;
  }

  async getPendingInvites(adminId = null) {
    let query = { status: 'pending' };
    
    // If adminId provided, filter by creator
    if (adminId) {
      query.createdBy = adminId;
    }

    const invites = await Invite.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return invites;
  }

  async getInviteStats() {
    const stats = await Invite.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      accepted: stats.find(s => s._id === 'accepted')?.count || 0,
      expired: stats.find(s => s._id === 'expired')?.count || 0,
      cancelled: stats.find(s => s._id === 'cancelled')?.count || 0
    };
  }

  // Helper method to get full name
  getFullName(invite) {
    return `${invite.firstName} ${invite.lastName}`;
  }

  // Helper method to check if expired
  isInviteExpired(invite) {
    return new Date() > invite.expiresAt;
  }

  // Clean up expired invites (can be run as a cron job)
  async cleanupExpiredInvites() {
    const result = await Invite.updateMany(
      { 
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      { 
        status: 'expired' 
      }
    );

    return result.modifiedCount;
  }
}