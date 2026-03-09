// backend/src/mail/mailService.js
const SibApiV3Sdk = require('@getbrevo/brevo');

// On prépare la structure, la clé sera ajoutée plus tard dans le .env
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendWelcomeEmail = async (contactEmail, contactName) => {
  // Cette fonction sera appelée quand un nouveau prospect est créé
  console.log(`Préparation de l'envoi du mail à ${contactEmail}`);

  // Logique Brevo à activer une fois le compte validé
  /*
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.templateId = 1; // ID du modèle que tu créeras sur Brevo
  sendSmtpEmail.to = [{ "email": contactEmail, "name": contactName }];
  */
};

module.exports = { sendWelcomeEmail };