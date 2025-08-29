import crypto from 'crypto';
import { InviteModel } from '../models/Invite.js';

export class InviteService {
  async createTrainerInvite(inviteData) {
    const token = this.generateInviteToken();
    const expiresAt = this.calculateExpirationDate();
    
    const invite = new InviteModel({
      email: inviteData.email.toLowerCase(),
      firstName: inviteData.firstName,
      lastName: inviteData.lastName,
      role: 'trainer',
      token,
      expiresAt,
      specialties: inviteData.specialties,
      status: 'pending',
      createdBy: inviteData.adminId
    });

    return await invite.save();
  }

  generateInviteToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  calculateExpirationDate() {
    const expirationDays = process.env.INVITE_EXPIRATION_DAYS || 7;
    return new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000));
  }

  async validateInvite(token) {
    const invite = await InviteModel.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      throw new ValidationError('Invalid or expired invite');
    }

    return invite;
  }

  async markInviteAsUsed(inviteId) {
    return await InviteModel.findByIdAndUpdate(
      inviteId, 
      { status: 'accepted', acceptedAt: new Date() },
      { new: true }
    );
  }
}