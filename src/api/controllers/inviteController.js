import { EmailService } from '../services/EmailService.js';
import { InviteService } from '../services/InviteService.js';
import { ValidationService } from '../services/ValidationService.js';
import { Logger } from '../utils/Logger.js';

export class InviteController {
  constructor() {
    this.emailService = new EmailService();
    this.inviteService = new InviteService();
    this.validationService = new ValidationService();
    this.logger = new Logger('InviteController');
  }

  async sendTrainerInvite(req, res) {
    try {
      const inviteData = this.extractInviteData(req.body);
      
      this.validateInviteData(inviteData);
      
      await this.checkExistingUser(inviteData.email);
      
      const invite = await this.inviteService.createTrainerInvite(inviteData);
      
      await this.emailService.sendTrainerInvite({
        ...inviteData,
        inviteToken: invite.token,
        inviteLink: this.buildInviteLink(invite.token)
      });

      this.logger.info(`Trainer invite sent to ${inviteData.email} by admin ${req.user.id}`);
      
      return res.status(200).json({
        success: true,
        message: 'Trainer invite sent successfully',
        inviteId: invite.id
      });
    } catch (error) {
      this.handleInviteError(error, res);
    }
  }

  extractInviteData(body) {
    const { firstName, lastName, email, specialties, message } = body;
    return { firstName, lastName, email, specialties, message };
  }

  validateInviteData(inviteData) {
    this.validationService.validateEmail(inviteData.email);
    this.validationService.validateName(inviteData.firstName);
    this.validationService.validateName(inviteData.lastName);
  }

  async checkExistingUser(email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }
  }

  buildInviteLink(token) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/trainer-invite/${token}`;
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