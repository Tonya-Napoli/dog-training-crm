const { Router } = require('express');
const { getAllClients } = require('../../data/users');
const sgMail = require('@sendgrid/mail');

// Inline EMAILS constants for Puppy Pros Training
const EMAILS = {
  WELCOME_SUBJECT: "Welcome to Puppy Pros Training!",
  INVITE_CLIENT_HTML: (name, formLink) =>
    `Hello ${name},<br/><br/>Please register using the following link: <a href="${formLink}">${formLink}</a><br/><br/>Thank you!`,
  TRANSFER: "Client Transfer Invitation",
  TRANSFER_HTML: (name) =>
    `Hello ${name},<br/><br/>You have been invited for a client transfer. Please contact your manager for details.`,
  REFERRAL_ALERT_SUBJECT: "Referral Alert from Puppy Pros Training",
  REFERRAL_ALERT: (name, email, phone, address, notes, referrer) =>
    `Referral Alert:<br/><br/>Client Name: ${name}<br/>Email: ${email}<br/>Phone: ${phone}<br/>Address: ${address}<br/>Notes: ${notes}<br/>Referred by: ${referrer}`,
  INVITE_PARTNER_HTML: (name, formLink) =>
    `Hello ${name},<br/><br/>Please register as our partner using this link: <a href="${formLink}">${formLink}</a><br/><br/>Thank you!`,
  INVITE_SUBSCRIBER_HTML: (name, formLink) =>
    `Hello ${name},<br/><br/>Please register as a subscriber using this link: <a href="${formLink}">${formLink}</a><br/><br/>Thank you!`,
  SCHEDULE_FOLLOWUP: "Schedule Your Follow-Up",
  SCHEDULE_FOLLOWUP_HTML: (name) =>
    `Hello ${name},<br/><br/>Please schedule your follow-up appointment at your earliest convenience.`,
  EXISTING_REFERRAL_ALERT: (name, email, phone, address, notes, clientId, referrer) =>
    `Referral Alert (Existing Client):<br/><br/>Client Name: ${name}<br/>Email: ${email}<br/>Phone: ${phone}<br/>Address: ${address}<br/>Notes: ${notes}<br/>Client ID: ${clientId}<br/>Referred by: ${referrer}`
};

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const router = Router();

// Template generators rebranded for Puppy Pros Training
const generateInviteTemplate = (body) => (
  `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Puppy Pros Training Email</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        p { color: #666; line-height: 1.5; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>${body}</p>
        <div class="footer">
          <p>&copy; 2024 Puppy Pros Training. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `
);

const generateReferTemplate = (body) => (
  `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Puppy Pros Training Email</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        p { color: #666; line-height: 1.5; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>${body}</p>
        <div class="footer">
          <p>&copy; 2024 Puppy Pros Training. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `
);

// Invite a single client
router.post('/invite-client', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;
    const clientsResult = await getAllClients();

    const clientExists = clientsResult && clientsResult.Items
      ? clientsResult.Items.filter(client =>
          client.userInfo.email.toLowerCase() === email.toLowerCase()
        ).length >= 1
      : false;

    if (clientExists) {
      return res.status(400).json({ error: 'Client exists in system' });
    }

    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.WELCOME_SUBJECT,
      html: generateInviteTemplate(EMAILS.INVITE_CLIENT_HTML(name, formLink))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Bulk invite clients
router.post('/bulk-invite-client', async (req, res) => {
  try {
    const invites = req.body;
    const clientsResult = await getAllClients();

    const invitePromises = invites.map(invite => {
      const clientExists = clientsResult && clientsResult.Items
        ? clientsResult.Items.filter(client =>
            client.userInfo.email.toLowerCase() === invite.email.toLowerCase()
          ).length >= 1
        : false;

      if (clientExists) {
        return { success: false, email: invite.email, error: 'Client exists in system' };
      }

      const msg = {
        to: invite.email,
        from: 'pupmail@puppyprostraining.com',
        subject: EMAILS.TRANSFER,
        html: generateInviteTemplate(EMAILS.TRANSFER_HTML(invite.name))
      };

      return sgMail.send(msg)
        .then(() => ({ success: true, email: invite.email }))
        .catch(error => ({ success: false, email: invite.email, error: error.message }));
    });

    const results = await Promise.allSettled(invitePromises);
    const report = results.map((result, index) => ({
      ...invites[index],
      status: result.status,
      ...(result.status === 'rejected' ? { error: result.reason } : {}),
    }));

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refer a client (new client referral)
router.post('/refer-client', async (req, res) => {
  try {
    const { name, email, phone, address, notes, referrer } = req.body;
    
    const refer = {
      to: "manager@puppyprostraining.com",
      cc: ["info@puppyprostraining.com", "support@puppyprostraining.com"],
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.REFERRAL_ALERT_SUBJECT,
      html: generateReferTemplate(EMAILS.REFERRAL_ALERT(name, email, phone, address, notes, referrer))
    };

    const formLink = `https://puppyprostraining.com/register-client?fi=unique-identifier&name=${name.split(' ').join('-')}&email=${email}`;
  
    const invite = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.WELCOME_SUBJECT,
      html: generateInviteTemplate(EMAILS.INVITE_CLIENT_HTML(name, formLink))
    };

    const referResult = await sgMail.send(refer);
    const inviteResult = await sgMail.send(invite);

    res.status(202).json({ referResult, inviteResult });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
});

// Refer an existing client
router.post('/refer-existing-client', async (req, res) => {
  try {
    const { client, notes, referrer } = req.body;
    const { name, phone, address, email } = client.userInfo;
   
    const msg = {
      to: "manager@puppyprostraining.com",
      cc: ["info@puppyprostraining.com", "support@puppyprostraining.com"],
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.REFERRAL_ALERT_SUBJECT,
      html: generateReferTemplate(EMAILS.EXISTING_REFERRAL_ALERT(name, email, phone, address, notes, client.id, referrer))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
});

// Follow-up email
router.post('/followup', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.SCHEDULE_FOLLOWUP,
      html: generateReferTemplate(EMAILS.SCHEDULE_FOLLOWUP_HTML(name))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
});

// Invite a member
router.post('/invite-member', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;
    
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.WELCOME_SUBJECT,
      html: generateInviteTemplate(EMAILS.INVITE_SUBSCRIBER_HTML(name, formLink))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Bulk invite members
router.post('/bulk-invite-member', async (req, res) => {
  try {
    const invites = req.body;

    const invitePromises = invites.map(invite => {        
      const msg = {
        to: invite.email,
        from: 'pupmail@puppyprostraining.com',
        subject: EMAILS.WELCOME_SUBJECT,
        html: generateInviteTemplate(EMAILS.INVITE_SUBSCRIBER_HTML(invite.name, invite.formLink))
      };
      
      return sgMail.send(msg)
        .then(() => ({ success: true, email: invite.email }))
        .catch(error => ({ success: false, email: invite.email, error: error.message }));
    });

    const results = await Promise.allSettled(invitePromises);
    const report = results.map((result, index) => ({
      ...invites[index],
      status: result.status,
      ...(result.status === 'rejected' ? { error: result.reason } : {}),
    }));

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite a company
router.post('/invite-company', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;
    
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.WELCOME_SUBJECT,
      html: generateInviteTemplate(EMAILS.INVITE_SUBSCRIBER_HTML(name, formLink))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Invite a partner
router.post('/invite-partner', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;
    
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: EMAILS.WELCOME_SUBJECT,
      html: generateInviteTemplate(EMAILS.INVITE_PARTNER_HTML(name, formLink))
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Credit application invite
router.post('/credit/application', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;

    const htmlBody = `
      <h2>Hello, ${name}</h2>
      <br />
      <p>
        Your account manager has requested permission to do a soft credit pull. Click below to fill out and submit the required information.
      </p>
      <br />
      👉 ${formLink}
      <br />
    `;
    
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: 'Application Invite from Puppy Pros Training',
      html: generateInviteTemplate(htmlBody)
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Manager invite
router.post('/managers/0', async (req, res) => {
  try {
    const { name, email, formLink } = req.body;

    const htmlBody = `
      <h2>Hello, ${name}</h2>
      <br />
      <p>
        Your Puppy Pros Training manager account has been created. Click below to fill out and submit the required information.
      </p>
      <br />
      👉 ${formLink}
      <br />
    `;

    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: 'Manager Access to Puppy Pros Training',
      html: generateInviteTemplate(htmlBody)
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Credit application ready notification
router.post('/ready', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const htmlBody = `
      <h2>Hello, ${name}</h2>
      <br />
      <p>
        A client has submitted an application for a credit pull. Login below to view the application and pull credit.
      </p>
      <br />
      👉 Login
      <br />
    `;
    const msg = {
      to: email,
      from: 'pupmail@puppyprostraining.com',
      subject: 'Credit Application Ready',
      html: generateInviteTemplate(htmlBody)
    };

    const result = await sgMail.send(msg);
    res.status(202).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;






