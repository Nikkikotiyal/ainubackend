// utils/sendEmail.js
const nodemailer = require("nodemailer");

// Configure transporter for RediffmailPro SMTP
const transporter = nodemailer.createTransport({
  name: "encodeapp.in", // Set FQDN to fix HELO error
  host: "smtp.rediffmailpro.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "info@encodeapp.in",
    pass: "44570650",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send email using Rediffmail SMTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text body of the email
 */
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: 'info@encodeapp.in', // Sender name and email
      to,
      subject, 
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;
