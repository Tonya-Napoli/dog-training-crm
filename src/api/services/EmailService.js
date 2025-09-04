import { Resend } from 'resend';
import { EmailTemplateService } from './EmailTemplateService.js';
import { Logger } from '../../utils/Logger.js';
import { EmailServiceError } from '../../utils/errors.js';

export class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.templateService = new EmailTemplateService();
    this.logger = new Logger('EmailService');
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendTrainerInvite(inviteData) {
    this.validateResendConfig();
      console.log('🔧 [EmailService] Debug Info:');
      console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
      console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);
      console.log('- TO_EMAIL:', inviteData.email);
      console.log('- Invite data:', JSON.stringify(inviteData, null, 2));

    
    try {
      const emailTemplate = this.templateService.generateTrainerInviteTemplate(inviteData);
        console.log('🔧 [EmailService] Debug Info:');
        console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);
        console.log('- TO_EMAIL:', inviteData.email);
        console.log('- Invite data:', JSON.stringify(inviteData, null, 2));

      const emailResult = await this.resend.emails.send({
        from: this.fromEmail,
        to: inviteData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
      
      console.log(`[EmailService] Resend API Response:`, JSON.stringify(emailResult, null, 2));

      this.logger.info(`Trainer invite sent to ${inviteData.email}`, { emailId: emailResult.id });
      
      return { 
        success: true, 
        message: 'Invite sent successfully',
        emailId: emailResult.id 
      };
    } catch (error) {
      console.error('[EmailService] Resend Error Details:', {
        message: error.message,
        name: error.name,
        status: error.status,
        body: error.body
      });
      
      this.logger.error(`Failed to send trainer invite: ${error.message}`);
      throw new EmailServiceError(`Failed to send trainer invite: ${error.message}`);
    }
  }

  async sendWelcomeEmail(userData) {
    this.validateResendConfig();
    
    try {
      const emailTemplate = this.templateService.generateWelcomeTemplate(userData);
      
      const emailResult = await this.resend.emails.send({
        from: this.fromEmail,
        to: userData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });

      this.logger.info(`Welcome email sent to ${userData.email}`, { emailId: emailResult.id });
      return { success: true, emailId: emailResult.id };
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
      throw new EmailServiceError(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendNotificationEmail(notificationData) {
    this.validateResendConfig();
    
    try {
      const emailTemplate = this.templateService.generateNotificationTemplate(notificationData);
      
      const emailResult = await this.resend.emails.send({
        from: this.fromEmail,
        to: process.env.NOTIFICATION_EMAIL || 'tonya@puppyprostraining.com',
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });

      this.logger.info(`Notification email sent`, { emailId: emailResult.id });
      return { success: true, emailId: emailResult.id };
    } catch (error) {
      this.logger.error(`Failed to send notification email: ${error.message}`);
      throw new EmailServiceError(`Failed to send notification email: ${error.message}`);
    }
  }

  validateResendConfig() {
    if (!process.env.RESEND_API_KEY) {
      throw new EmailServiceError('RESEND_API_KEY is not configured');
    }
  }
}