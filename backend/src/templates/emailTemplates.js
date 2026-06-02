function buildVerificationEmail({ userName, verifyLink, isResend = false }) {
  const title = isResend
    ? "VitaCore email verification resent"
    : "VitaCore email verification";

  return `
    <div style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial,sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg, #111111, #2d3748); padding:32px 40px;">
          <div style="font-size:14px; color:#d1d5db; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">
            VitaCore
          </div>
          <h1 style="margin:0; font-size:28px; color:#ffffff;">
            ${title}
          </h1>
        </div>

        <div style="padding:40px;">
          <p style="margin:0 0 16px; font-size:16px; color:#1f2937; line-height:1.7;">
            Hello, <strong>${userName}</strong>.
          </p>

          <p style="margin:0 0 16px; font-size:16px; color:#4b5563; line-height:1.7;">
            Please complete email verification by clicking the button below.
          </p>

          <p style="margin:0 0 28px;">
            <a
              href="${verifyLink}"
              style="display:inline-block; padding:14px 24px; background:#111111; color:#ffffff; text-decoration:none; border-radius:12px; font-weight:700;"
            >
              Verify email
            </a>
          </p>

          <div style="margin:0 0 24px; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px;">
            <p style="margin:0 0 8px; font-size:14px; color:#374151; font-weight:600;">
              Button not working?
            </p>
            <p style="margin:0; font-size:14px; line-height:1.7; color:#6b7280; word-break:break-all;">
              Paste this link into your browser:<br />
              <a href="${verifyLink}" style="color:#111111; text-decoration:underline;">
                ${verifyLink}
              </a>
            </p>
          </div>

          <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.7;">
            This link is valid for <strong>30 minutes</strong>.
          </p>
        </div>
      </div>
    </div>
  `;
}

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

function buildVerificationResultPage({ title, message, success = true }) {
  const icon = success ? "OK" : "ERROR";

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body style="margin:0; font-family:Arial,sans-serif; background:#f4f7fb; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px;">
      <div style="width:100%; max-width:480px; background:#ffffff; border-radius:20px; padding:40px 32px; box-shadow:0 8px 24px rgba(0,0,0,0.08); text-align:center;">
        <div style="font-size:32px; margin-bottom:16px;">${icon}</div>
        <h1 style="margin:0 0 12px; font-size:28px; color:#111827;">${title}</h1>
        <p style="margin:0; font-size:16px; line-height:1.7; color:#4b5563;">
          ${message}
        </p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  buildVerificationEmail,
  buildVerificationCodeEmail,
  buildVerificationResultPage,
};
