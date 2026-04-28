const nodemailer = require('nodemailer');

const isConfigured = !!process.env.SMTP_HOST;

const transportConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transportConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transporter = isConfigured ? nodemailer.createTransport(transportConfig) : null;

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  if (!isConfigured) {
    console.log('SMTP not configured, skipping email send:', to);
    return null;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail, isConfigured };
