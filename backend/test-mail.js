require('dotenv').config();
const { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } = require('@getbrevo/brevo');

// 1. Configuration de l'API
const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// 2. Création de l'objet Email
let sendSmtpEmail = new SendSmtpEmail();

sendSmtpEmail.subject = "Test SkillUp CRM - Fix Final";
sendSmtpEmail.htmlContent = "<html><body><h1>🚀 Test Réussi !</h1><p>La déstructuration Brevo fonctionne.</p></body></html>";
sendSmtpEmail.sender = { "name": "SkillUp", "email": "dihiasellah1@gmail.com" };
sendSmtpEmail.to = [{ "email": "dihiasellah1@gmail.com" }];

console.log("⏳ Tentative d'envoi avec la syntaxe déstructurée...");

// 3. Envoi
apiInstance.sendTransacEmail(sendSmtpEmail)
.then(data => {
console.log("✅ SUCCÈS ! ID du message :", JSON.stringify(data));
})
.catch(err => {
console.error("❌ ERREUR :");
if (err.response && err.response.body) {
console.error(JSON.stringify(err.response.body, null, 2));
} else {
console.error(err.message);
}
});