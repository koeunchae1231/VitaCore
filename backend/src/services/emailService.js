const transporter = require("../config/mailer");

async function sendEmail({ from, to, subject, html }) {
  try {
    return await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL_SEND_FAILED]", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
    });

    throw error;
  }
}

module.exports = {
  sendEmail,
};
