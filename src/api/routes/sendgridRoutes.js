const { Router } = require("express");
const sgMail = require("@sendgrid/mail");

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const router = Router();

// Visitor Email Route
router.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const msg = {
      to: "pupmail@puppyprostraining.com",
      from: "pupmail@puppyprostraining.com", // Make sure this email is verified in SendGrid
      subject: `New Inquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ success: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

module.exports = router;







