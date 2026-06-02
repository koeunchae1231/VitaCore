const transporter = require("../config/mailer");

async function sendEmail({ from, to, subject, html }) {
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

module.exports = {
  sendEmail,
};