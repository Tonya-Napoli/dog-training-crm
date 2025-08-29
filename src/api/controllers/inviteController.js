import { EmailService } from '../services/EmailService.js';
import { InviteService } from '../services/InviteService.js';
import { ValidationService } from '../services/ValidationService.js';
import { Logger } from '../utils/Logger.js';
import User from '../models/User.js';
import { EmailServiceError, ValidationError } from '../utils/errors.js';

export class InviteController {
  constructor() {
    this.emailService = new EmailService();
    this.inviteService = new InviteService();
    this.validationService = new ValidationService();
    this.logger = new Logger('InviteController');
  }

  async sendTrainerInvite(req, res) {
    try {
      const inviteData = this.extractInviteData(req.body, req.user.id);
      
      this.validateInviteData(inviteData);
      
      await this.checkExistingUser(inviteData.email);
      
      const invite = await this.inviteService.createTrainerInvite(inviteData);
      
      const emailResult = await this.emailService.sendTrainerInvite({
        ...inviteData,
        inviteToken: invite.token,
        inviteLink: this.buildInviteLink(invite.token)
      });

      // Send admin notification
      await this.sendAdminNotification('trainer_invited', inviteData);

      this.logger.info(`Trainer invite sent to ${inviteData.email} by admin ${req.user.id}`);
      
      return res.status(200).json({
        success: true,
        message: 'Trainer invite sent successfully',
        inviteId: invite._id,
        emailId: emailResult.emailId
      });
    } catch (error) {
      this.handleInviteError(error, res);
    }
  }

  async validateInvite(req, res) {
    try {
      const { token } = req.params;
      
      const invite = await this.inviteService.validateInvite(token);
      
      return res.status(200).json({
        success: true,
        invite: {
          firstName: invite.firstName,
          lastName: invite.lastName,
          email: invite.email,
          specialties: invite.specialties,
          expiresAt: invite.expiresAt
        }
      });
    } catch (error) {
      this.handleInviteError(error, res);
    }
  }

  async acceptInvite(req, res) {
    try {
      const { token } = req.params;
      const userData = req.body;
      
      const invite = await this.inviteService.validateInvite(token);
      
      // Create trainer account
      const newTrainer = await this.createTrainerFromInvite(invite, userData);
      
      // Mark invite as accepted
      await this.inviteService.markInviteAsUsed(invite._id);
      
      // Send welcome email
      await this.emailService.sendWelcomeEmail({
        firstName: newTrainer.firstName,
        lastName: newTrainer.lastName,
        email: newTrainer.email
      });

      // Send admin notification
      await this.sendAdminNotification('invite_accepted', newTrainer);

      this.logger.info(`Trainer invite accepted: ${newTrainer.email}`);
      
      return res.status(201).json({
        success: true,
        message: 'Registration completed successfully',
        user: {
          id: newTrainer._id,
          firstName: newTrainer.firstName,
          lastName: newTrainer.lastName,
          email: newTrainer.email,
          role: newTrainer.role
        }
      });
    } catch (error) {
      this.handleInviteError(error, res);
    }
  }

  extractInviteData(body, adminId) {
    const { firstName, lastName, email, specialties, message } = body;
    return { 
      firstName: firstName?.trim(), 
      lastName: lastName?.trim(), 
      email: email?.toLowerCase().trim(), 
      specialties: specialties || [], 
      message: message?.trim(),
      adminId 
    };
  }

  validateInviteData(inviteData) {
    if (!inviteData.firstName || !inviteData.lastName || !inviteData.email) {
      throw new ValidationError('First name, last name, and email are required');
    }
    
    this.validationService.validateEmail(inviteData.email);
  }

  async checkExistingUser(email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('A user with this email already exists');
    }
  }

  buildInviteLink(token) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/trainer-invite/${token}`;
  }

  async createTrainerFromInvite(invite, userData) {
    const newTrainer = new User({
      firstName: invite.firstName,
      lastName: invite.lastName,
      email: invite.email,
      password: userData.password,
      role: 'trainer',
      specialties: invite.specialties,
      certifications: userData.certifications || [],
      experience: userData.experience,
      bio: userData.bio,
      hourlyRate: userData.hourlyRate,
      availability: userData.availability,
      phone: userData.phone,
      isActive: true,
      agreesToTerms: true,
      adminNotes: {
        registrationMethod: 'invite',
        registeredBy: invite.createdBy
      }
    });

    return await newTrainer.save();
  }

  async sendAdminNotification(type, data) {
    try {
      await this.emailService.sendNotificationEmail({ type, user: data, details: data });
    } catch (error) {
      // Log but don't fail the main operation
      this.logger.error(`Failed to send admin notification: ${error.message}`);
    }
  }

  handleInviteError(error, res) {
    this.logger.error(`Invite error: ${error.message}`);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    if (error instanceof EmailServiceError) {
      return res.status(500).json({ success: false, message: 'Failed to send invite email' });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}