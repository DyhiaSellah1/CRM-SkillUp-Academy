const brevo = require('@getbrevo/brevo');
require('dotenv').config();

async function sendEmail(to, subject, htmlContent) {
   console.log('sendEmail');
  try {

    const apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL
    };

    sendSmtpEmail.to = [
      { email: to }
    ];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Email envoyé :", data);

  } catch (error) {

    console.error("Erreur Brevo :", error.message);

  }

}

module.exports = { sendEmail };