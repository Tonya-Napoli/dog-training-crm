import { EmailService } from '../services/EmailService.js';
import { InviteService } from '../services/InviteService.js';
import { ValidationService } from '../services/ValidationService.js';
import { InviteProcessor } from '../services/InviteProcessor.js';
import { Logger } from '../../utils/Logger.js';
import { InviteResponseBuilder } from '../../utils/InviteResponseBuilder.js';
import { InviteErrorHandler } from '../../utils/InviteErrorHandler.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { REQUIRED_INVITE_FIELDS } from '../../constants/inviteConstants.js';
import { ValidationError, NotFoundError, DatabaseError } from '../../utils/errors.js';
import User from '../models/User.js';

export class InviteController {
  constructor() { 
    this.emailService = new EmailService();
    this.inviteService = new InviteService();
    this.validationService = new ValidationService();
    this.logger = new Logger('InviteController');
    this.inviteProcessor = new InviteProcessor(this.inviteService, this.emailService, this.logger);
    this.errorHandler = new InviteErrorHandler(this.logger);
  }

  async sendTrainerInvite(req, res) {
    try {
      const inviteData = this.extractAndValidateInviteData(req.body, req.user.id);
      await this.checkExistingUser(inviteData.email);
      
      const inviteResult = await this.inviteProcessor.processTrainerInvite(inviteData);
      const response = InviteResponseBuilder.buildInviteSuccessResponse(inviteResult);
      
      this.logger.info(`Trainer invite sent to ${inviteData.email} by admin ${req.user.id}`);
      return res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  async validateInvite(req, res) {
    try {
      const token = this.extractAndValidateToken(req.params);
      const invite = await this.getValidatedInvite(token);
      const response = InviteResponseBuilder.buildValidateInviteResponse(invite);
      
      return res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  async acceptInvite(req, res) {
    try {
      const { token } = req.params;
      const userData = req.body;
      
      const invite = await this.getValidatedInvite(token);
      const newTrainer = await this.inviteProcessor.processInviteAcceptance(invite, userData);
      const response = InviteResponseBuilder.buildAcceptInviteResponse(newTrainer);
      
      this.logger.info(`Trainer invite accepted: ${newTrainer.email}`);
      return res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  // Private helper methods
  extractAndValidateInviteData(body, adminId) {
    const inviteData = this.extractInviteData(body, adminId);
    this.validateInviteData(inviteData);
    return inviteData;
  }

  extractInviteData(body, adminId) {
    const { firstName, lastName, email, specialties, message } = body;
    return { 
      firstName: firstName?.trim() || '', 
      lastName: lastName?.trim() || '', 
      email: email?.toLowerCase().trim() || '', 
      specialties: specialties || [], 
      message: message?.trim() || '',
      adminId 
    };
  }

  validateInviteData(inviteData) {
    const missingFields = REQUIRED_INVITE_FIELDS.filter(field => !inviteData[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(`Required fields missing: ${missingFields.join(', ')}`);
    }
    this.validationService.validateEmail(inviteData.email);
  }

  async checkExistingUser(email) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ValidationError('A user with this email already exists');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to check existing user: ${error.message}`);
    }
  }

  extractAndValidateToken(params) {
    const { token } = params;
    if (!token) {
      throw new ValidationError('Invite token is required');
    }
    return token;
  }

  async getValidatedInvite(token) {
    const invite = await this.inviteService.validateInvite(token);
    if (!invite) {
      throw new NotFoundError('Invite not found or expired');
    }
    return invite;
  }
}