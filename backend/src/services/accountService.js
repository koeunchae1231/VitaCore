const bcrypt = require("bcrypt");
const db = require("../config/db");
const dbQuery = require("../utils/dbQuery");
const createError = require("../utils/createError");
const { sendEmail } = require("./emailService");
const { logSecurityEvent } = require("./securityEventService");
const { buildVerificationCodeEmail } = require("../templates/emailTemplates");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_FROM = process.env.EMAIL_FROM;
const PASSWORD_SALT_ROUNDS = 10;
const VERIFICATION_CODE_SALT_ROUNDS = 10;
const VERIFICATION_CODE_EXPIRES_MINUTES = 5;

function createExpiresAt(minutes) {
  return new Date(Date.now() + 1000 * 60 * minutes);
}

function isExpired(dateValue) {
  return new Date(dateValue) < new Date();
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function findUserById(userId, connection = null) {
  const sql = `
    SELECT id, name, email, email_verified, password_hash, is_active
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [userId], connection);
  return results[0] || null;
}

async function findUserByEmail(email, connection = null) {
  const sql = `
    SELECT id, name, email, email_verified, is_active
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [email], connection);
  return results[0] || null;
}

async function upsertVerificationToken({ email, tokenHash, expiresAt }, connection = null) {
  const sql = `
    INSERT INTO email_verification_tokens (email, token_hash, expires_at, verified_at)
    VALUES (?, ?, ?, NULL)
    ON DUPLICATE KEY UPDATE
      token_hash = VALUES(token_hash),
      expires_at = VALUES(expires_at),
      verified_at = NULL
  `;

  await dbQuery(sql, [email, tokenHash, expiresAt], connection);
}

async function findVerificationByEmail(email, connection = null) {
  const sql = `
    SELECT id, email, token_hash, expires_at, verified_at, created_at
    FROM email_verification_tokens
    WHERE email = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [email], connection);
  return results[0] || null;
}

async function deleteVerificationByEmail(email, connection = null) {
  await dbQuery(
    "DELETE FROM email_verification_tokens WHERE email = ?",
    [email],
    connection
  );
}

async function sendCodeEmail({ email, code, subject }) {
  const html = buildVerificationCodeEmail({
    code,
    expiresMinutes: VERIFICATION_CODE_EXPIRES_MINUTES,
  });

  await sendEmail({
    from: EMAIL_FROM || EMAIL_USER,
    to: email,
    subject,
    html,
  });
}

async function createAndSendCode({ email, subject }) {
  const code = generateVerificationCode();
  const tokenHash = await bcrypt.hash(code, VERIFICATION_CODE_SALT_ROUNDS);
  const expiresAt = createExpiresAt(VERIFICATION_CODE_EXPIRES_MINUTES);

  await upsertVerificationToken({ email, tokenHash, expiresAt });
  await sendCodeEmail({ email, code, subject });
}

async function assertValidCode({ email, code, connection = null }) {
  const verification = await findVerificationByEmail(email, connection);

  if (!verification) {
    throw createError("인증 코드가 올바르지 않습니다.", 400, {
      code: "VERIFICATION_NOT_FOUND",
    });
  }

  if (isExpired(verification.expires_at)) {
    throw createError("인증 코드가 만료되었습니다.", 400, {
      code: "VERIFICATION_CODE_EXPIRED",
    });
  }

  const isMatch = await bcrypt.compare(String(code || ""), verification.token_hash);
  if (!isMatch) {
    throw createError("인증 코드가 올바르지 않습니다.", 400, {
      code: "INVALID_VERIFICATION_CODE",
    });
  }
}

async function deleteAccount({ userId, password, ipAddress }) {
  const user = await findUserById(userId);

  if (!user || !user.is_active) {
    throw createError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const isMatch = await bcrypt.compare(String(password || ""), user.password_hash);
  if (!isMatch) {
    await logSecurityEvent({
      userId,
      eventType: "ACCOUNT_DELETE_FAILED",
      description: "계정 삭제 비밀번호 불일치",
      ipAddress,
    });

    throw createError("비밀번호가 일치하지 않습니다.", 401, {
      code: "WRONG_PASSWORD",
    });
  }

  await dbQuery("UPDATE users SET is_active = 0 WHERE id = ?", [userId]);

  await logSecurityEvent({
    userId,
    eventType: "ACCOUNT_DEACTIVATED",
    description: "계정 비활성화 처리",
    ipAddress,
  });

  return { message: "계정이 삭제되었습니다." };
}

async function sendEmailChangeCode({ userId, email, ipAddress }) {
  const nextEmail = normalizeEmail(email);
  if (!nextEmail) {
    throw createError("새 이메일을 입력해 주세요.", 400, { code: "EMAIL_REQUIRED" });
  }

  const existingUser = await findUserByEmail(nextEmail);
  if (existingUser && String(existingUser.id) !== String(userId)) {
    await logSecurityEvent({
      userId,
      eventType: "EMAIL_CHANGE_FAILED",
      description: "이미 사용 중인 이메일로 변경 시도",
      ipAddress,
    });

    throw createError("이미 사용 중인 이메일입니다.", 409, {
      code: "DUPLICATE_EMAIL",
    });
  }

  await createAndSendCode({
    email: nextEmail,
    subject: "[VitaCore] 이메일 변경 인증 코드",
  });

  await logSecurityEvent({
    userId,
    eventType: "EMAIL_CHANGE_CODE_SENT",
    description: "이메일 변경 인증 코드 발송",
    ipAddress,
  });

  return { message: "인증 코드가 새 이메일로 전송되었습니다." };
}

async function changeEmail({ userId, email, code, ipAddress }) {
  const nextEmail = normalizeEmail(email);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const existingUser = await findUserByEmail(nextEmail, connection);
    if (existingUser && String(existingUser.id) !== String(userId)) {
      throw createError("이미 사용 중인 이메일입니다.", 409, {
        code: "DUPLICATE_EMAIL",
      });
    }

    await assertValidCode({ email: nextEmail, code, connection });

    await dbQuery(
      "UPDATE users SET email = ?, email_verified = 1 WHERE id = ?",
      [nextEmail, userId],
      connection
    );
    await deleteVerificationByEmail(nextEmail, connection);
    await connection.commit();

    await logSecurityEvent({
      userId,
      eventType: "EMAIL_CHANGED",
      description: "이메일 변경 완료",
      ipAddress,
    });

    return { message: "이메일이 변경되었습니다." };
  } catch (err) {
    await connection.rollback();
    await logSecurityEvent({
      userId,
      eventType: "EMAIL_CHANGE_FAILED",
      description: "이메일 변경 실패",
      ipAddress,
    });
    throw err;
  } finally {
    connection.release();
  }
}

async function sendPasswordResetCode({ userId, ipAddress }) {
  const user = await findUserById(userId);
  if (!user || !user.is_active) {
    throw createError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  await createAndSendCode({
    email: user.email,
    subject: "[VitaCore] 비밀번호 초기화 인증 코드",
  });

  await logSecurityEvent({
    userId,
    eventType: "PASSWORD_RESET_CODE_SENT",
    description: "비밀번호 초기화 인증 코드 발송",
    ipAddress,
  });

  return { message: "비밀번호 초기화 인증 코드가 전송되었습니다." };
}

async function resetPassword({ userId, code, newPassword, ipAddress }) {
  const user = await findUserById(userId);
  if (!user || !user.is_active) {
    throw createError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  if (typeof newPassword !== "string" || newPassword.trim().length < 8) {
    throw createError("새 비밀번호는 8자 이상이어야 합니다.", 400, {
      code: "INVALID_PASSWORD",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await assertValidCode({ email: user.email, code, connection });

    const passwordHash = await bcrypt.hash(newPassword.trim(), PASSWORD_SALT_ROUNDS);
    await dbQuery(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, userId],
      connection
    );
    await deleteVerificationByEmail(user.email, connection);
    await connection.commit();

    await logSecurityEvent({
      userId,
      eventType: "PASSWORD_RESET_SUCCESS",
      description: "비밀번호 변경 완료",
      ipAddress,
    });

    return { message: "비밀번호가 변경되었습니다." };
  } catch (err) {
    await connection.rollback();
    await logSecurityEvent({
      userId,
      eventType: "PASSWORD_RESET_FAILED",
      description: "비밀번호 변경 실패",
      ipAddress,
    });
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  deleteAccount,
  sendEmailChangeCode,
  changeEmail,
  sendPasswordResetCode,
  resetPassword,
};
