// src/api/services/EmailTemplateService.js
export class EmailTemplateService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.companyName = 'Puppy Pros Training';
  }

  generateTrainerInviteTemplate({ firstName, lastName, email, inviteToken, inviteLink, specialties, message }) {
    return {
      subject: `Invitation to Join ${this.companyName} as a Professional Trainer`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trainer Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .cta-button { display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #e5e5e5; padding: 20px; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .specialties { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐕 ${this.companyName}</h1>
              <p>Professional Dog Training Services</p>
            </div>
            
            <div class="content">
              <h2>You're Invited to Join Our Team!</h2>
              
              <p>Hi ${firstName},</p>
              
              <p>We're excited to invite you to join our team of professional dog trainers at ${this.companyName}. Based on your experience and expertise, we believe you'd be a valuable addition to our growing community.</p>
              
              ${specialties && specialties.length > 0 ? `
              <div class="specialties">
                <h3>We're particularly interested in your expertise in:</h3>
                <ul>
                  ${specialties.map(specialty => `<li>${this.formatSpecialty(specialty)}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${message ? `
              <p><strong>Personal message from our team:</strong></p>
              <p style="font-style: italic; background-color: #f0f7ff; padding: 15px; border-left: 4px solid #2563eb;">${message}</p>
              ` : ''}
              
              <p>To complete your registration and set up your trainer profile, please click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${inviteLink}" class="cta-button">Complete Your Registration</a>
              </div>
              
              <p><strong>⏰ This invitation expires in 7 days.</strong></p>
              
              <h3>What happens next?</h3>
              <ul>
                <li>Complete your profile with certifications and experience</li>
                <li>Set your availability and rates</li>
                <li>Start connecting with clients in your area</li>
                <li>Join our supportive community of professional trainers</li>
              </ul>
              
              <p>If you have any questions about the registration process or working with ${this.companyName}, please don't hesitate to reach out to our team.</p>
              
              <p>We look forward to welcoming you aboard!</p>
              
              <p>Best regards,<br>
              <strong>The ${this.companyName} Team</strong></p>
            </div>
            
            <div class="footer">
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${inviteLink}</p>
              <p>This email was sent to ${email}. If you weren't expecting this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  generateWelcomeTemplate({ firstName, lastName, email, tempPassword, loginUrl }) {
    return {
      subject: `Welcome to ${this.companyName} - Account Created`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .credentials { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .cta-button { display: inline-block; padding: 15px 30px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #e5e5e5; padding: 20px; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ${this.companyName}!</h1>
            </div>
            
            <div class="content">
              <h2>Your Account Has Been Created</h2>
              
              <p>Hello ${firstName},</p>
              
              <p>Welcome to ${this.companyName}! Your account has been successfully created by our team.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                ${tempPassword ? `<p><strong>Temporary Password:</strong> ${tempPassword}</p>` : ''}
              </div>
              
              <p><strong>🔒 Important:</strong> Please log in and change your password as soon as possible for security.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl || `${this.baseUrl}/login`}" class="cta-button">Login to Your Account</a>
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>We're excited to have you as part of our community!</p>
              
              <p>Best regards,<br>
              <strong>The ${this.companyName} Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${email}.</p>
              <p>© ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  generateNotificationTemplate({ type, user, details }) {
    const subjectMap = {
      'trainer_registered': `New Trainer Registration: ${user.firstName} ${user.lastName}`,
      'trainer_invited': `Trainer Invited: ${user.firstName} ${user.lastName}`,
      'client_registered': `New Client Registration: ${user.firstName} ${user.lastName}`,
      'invite_accepted': `Trainer Invite Accepted: ${user.firstName} ${user.lastName}`
    };

    return {
      subject: subjectMap[type] || `${this.companyName} Notification`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Admin Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 Admin Notification</h2>
            </div>
            <div class="content">
              <h3>${subjectMap[type] || 'System Notification'}</h3>
              
              <div class="details">
                <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                
                ${details ? Object.entries(details).map(([key, value]) => 
                  `<p><strong>${this.formatLabel(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</p>`
                ).join('') : ''}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  formatSpecialty(specialty) {
    return specialty.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
  }

  formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1')
             .replace(/^./, str => str.toUpperCase())
             .trim();
  }
}