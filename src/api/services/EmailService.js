import sgMail from '@sendgrid/mail';
import { EmailTemplateService } from './EmailTemplateService.js';
import { Logger } from '../utils/Logger.js';

export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.templateService = new EmailTemplateService();
    this.logger = new Logger('EmailService');
  }

  async sendTrainerInvite(inviteData) {
    try {
      const emailTemplate = this.templateService.generateTrainerInviteTemplate(inviteData);
      
      const mailOptions = {
        to: inviteData.email,
        from: process.env.FROM_EMAIL || 'noreply@puppyprostraining.com',
        subject: emailTemplate.subject,
        html: emailTemplate.html
      };

      await sgMail.send(mailOptions);
      this.logger.info(`Trainer invite sent to ${inviteData.email}`);
      
      return { success: true, message: 'Invite sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send trainer invite: ${error.message}`);
      throw new EmailServiceError(`Failed to send trainer invite: ${error.message}`);
    }
  }

  async sendWelcomeEmail(userData) {
    // Implementation for welcome emails
  }

  async sendNotificationEmail(notificationData) {
    // Implementation for admin notifications
  }
}