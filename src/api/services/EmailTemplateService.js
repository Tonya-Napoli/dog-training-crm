export class EmailTemplateService {
  generateTrainerInviteTemplate({ firstName, lastName, email, inviteToken, inviteLink }) {
    return {
      subject: `Invitation to Join Puppy Pros Training as a Trainer`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Trainer Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to Puppy Pros Training!</h1>
            
            <p>Hi ${firstName},</p>
            
            <p>You've been invited to join our team of professional dog trainers at Puppy Pros Training.</p>
            
            <p>To complete your registration and set up your trainer profile, please click the link below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Complete Registration
              </a>
            </div>
            
            <p><strong>This invitation will expire in 7 days.</strong></p>
            
            <p>If you have any questions, please don't hesitate to reach out to our team.</p>
            
            <p>Best regards,<br>The Puppy Pros Training Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              If you can't click the button above, copy and paste this link into your browser:<br>
              ${inviteLink}
            </p>
          </div>
        </body>
        </html>
      `
    };
  }

  generateWelcomeTemplate(userData) {
    // Template for welcome emails
  }

  generateNotificationTemplate(notificationData) {
    // Template for admin notifications
  }
}