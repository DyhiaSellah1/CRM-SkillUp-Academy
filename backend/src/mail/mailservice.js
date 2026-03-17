const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || "SkillUp CRM"}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email envoyé :", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur envoi email :", error);
    throw error;
  }
}

module.exports = { sendEmail };