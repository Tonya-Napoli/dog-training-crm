import { NOTIFICATION_TYPES, TRAINER_DEFAULTS } from '../../constants/inviteConstants.js';
import { InviteError, EmailServiceError, DatabaseError } from '../../utils/errors.js';
import User from '../models/User.js';

export class InviteProcessor {
  constructor(inviteService, emailService, logger) {
    this.inviteService = inviteService;
    this.emailService = emailService;
    this.logger = logger;
  }

  async processTrainerInvite(inviteData) {
    const invite = await this.createInvite(inviteData);
    const emailResult = await this.sendInviteEmail(invite, inviteData);
    
    await this.sendAdminNotification(NOTIFICATION_TYPES.TRAINER_INVITED, inviteData);
    
    return { invite, emailResult };
  }

  async processInviteAcceptance(invite, userData) {
    const newTrainer = await this.createTrainerFromInvite(invite, userData);
    await this.markInviteAsUsed(invite._id);
    await this.sendWelcomeAndNotificationEmails(newTrainer);
    return newTrainer;
  }

  async createInvite(inviteData) {
    try {
      return await this.inviteService.createTrainerInvite(inviteData);
    } catch (error) {
      throw new InviteError(`Failed to create invite: ${error.message}`);
    }
  }

  async sendInviteEmail(invite, inviteData) {
    const emailData = {
      ...inviteData,
      inviteToken: invite.token,
      inviteLink: this.buildInviteLink(invite.token)
    };
    
    try {
      return await this.emailService.sendTrainerInvite(emailData);
    } catch (error) {
      throw new EmailServiceError(`Failed to send invite email: ${error.message}`);
    }
  }

  async createTrainerFromInvite(invite, userData) {
    const trainerData = this.buildTrainerData(invite, userData);
    
    try {
      const newTrainer = new User(trainerData);
      return await newTrainer.save();
    } catch (error) {
      throw new DatabaseError(`Failed to create trainer: ${error.message}`);
    }
  }

  buildTrainerData(invite, userData) {
    return {
      firstName: invite.firstName,
      lastName: invite.lastName,
      email: invite.email,
      password: userData.password,
      role: TRAINER_DEFAULTS.ROLE,
      specialties: invite.specialties,
      certifications: userData.certifications || [],
      experience: userData.experience,
      bio: userData.bio,
      hourlyRate: userData.hourlyRate,
      availability: userData.availability,
      phone: userData.phone,
      isActive: TRAINER_DEFAULTS.IS_ACTIVE,
      agreesToTerms: TRAINER_DEFAULTS.AGREES_TO_TERMS,
      adminNotes: {
        registrationMethod: TRAINER_DEFAULTS.REGISTRATION_METHOD,
        registeredBy: invite.createdBy
      }
    };
  }

  buildInviteLink(token) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/trainer-invite/${token}`;
  }

  async markInviteAsUsed(inviteId) {
    try {
      await this.inviteService.markInviteAsUsed(inviteId);
    } catch (error) {
      throw new InviteError(`Failed to mark invite as used: ${error.message}`);
    }
  }

  async sendWelcomeAndNotificationEmails(newTrainer) {
    await this.sendWelcomeEmail(newTrainer);
    await this.sendAdminNotification(NOTIFICATION_TYPES.INVITE_ACCEPTED, newTrainer);
  }

  async sendWelcomeEmail(trainer) {
    try {
      await this.emailService.sendWelcomeEmail({
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendAdminNotification(type, data) {
    try {
      await this.emailService.sendNotificationEmail({ 
        type, 
        user: data, 
        details: data 
      });
    } catch (error) {
      this.logger.error(`Failed to send admin notification: ${error.message}`);
    }
  }
}