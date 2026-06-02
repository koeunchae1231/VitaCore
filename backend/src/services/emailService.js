const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_RESEND_FROM = "VitaCore <onboarding@resend.dev>";
const EMAIL_FROM = process.env.EMAIL_FROM || DEFAULT_RESEND_FROM;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function toResendErrorLog(error) {
  return {
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    message: error.message,
  };
}

async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    const error = new Error("RESEND_API_KEY is not configured.");
    error.code = "RESEND_API_KEY_MISSING";
    console.error("[EMAIL_SEND_FAILED]", toResendErrorLog(error));
    throw error;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (result.error) {
      const error = new Error(result.error.message || "Resend email send failed.");
      error.name = result.error.name;
      error.code = result.error.name || "RESEND_SEND_FAILED";
      error.statusCode = result.error.statusCode;
      throw error;
    }

    return result;
  } catch (error) {
    console.error("[EMAIL_SEND_FAILED]", toResendErrorLog(error));
    throw error;
  }
}

module.exports = {
  sendEmail,
};
