function buildVerificationCodeEmail({ code, expiresMinutes }) {
  return `
    <div style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial,sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg, #111111, #2d3748); padding:32px 40px;">
          <div style="font-size:14px; color:#d1d5db; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">
            VitaCore
          </div>
          <h1 style="margin:0; font-size:28px; color:#ffffff;">
            Email verification code
          </h1>
        </div>

        <div style="padding:40px;">
          <p style="margin:0 0 16px; font-size:16px; color:#4b5563; line-height:1.7;">
            Enter this code to verify your VitaCore account.
          </p>

          <p style="margin:0 0 24px; font-size:36px; letter-spacing:0.2em; font-weight:700; color:#111827;">
            ${code}
          </p>

          <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.7;">
            This code is valid for <strong>${expiresMinutes} minutes</strong>.
          </p>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  buildVerificationCodeEmail,
};
