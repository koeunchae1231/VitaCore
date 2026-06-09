const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const dbQuery = require("../utils/dbQuery");
const { sendEmail } = require("./emailService");
const { logSecurityEvent } = require("./securityEventService");
const { buildVerificationCodeEmail } = require("../templates/emailTemplates");
const createError = require("../utils/createError");

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_FROM = process.env.EMAIL_FROM;

const VERIFICATION_CODE_EXPIRES_MINUTES = 5;
const PASSWORD_SALT_ROUNDS = 10;
const VERIFICATION_CODE_SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET이 설정되지 않았습니다.");
}

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

function normalizeName(name) {
  return String(name || "").trim();
}

function maskEmail(email) {
  const [localPart, domain] = String(email || "").split("@");
  if (!localPart || !domain) {
    return "";
  }

  const visibleLength = Math.min(3, localPart.length);
  return `${localPart.slice(0, visibleLength)}***@${domain}`;
}

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified),
    isActive: Boolean(user.is_active),
  };
}

async function findUserByEmail(email, connection = null) {
  const sql = `
    SELECT id, name, email, email_verified, password_hash, is_active, last_login_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [email], connection);
  return results[0] || null;
}

async function findActiveUserByNameAndEmail({ name, email }, connection = null) {
  const sql = `
    SELECT id, name, email, email_verified, password_hash, is_active, last_login_at
    FROM users
    WHERE name = ? AND email = ? AND is_active = 1
    LIMIT 1
  `;

  const results = await dbQuery(sql, [name, email], connection);
  return results[0] || null;
}

async function findUserById(userId, connection = null) {
  const sql = `
    SELECT id, name, email, email_verified, is_active, last_login_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [userId], connection);
  return results[0] || null;
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

async function upsertVerificationToken(
  { email, tokenHash, expiresAt },
  connection = null
) {
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

async function markVerificationComplete(email, connection) {
  const sql = `
    UPDATE email_verification_tokens
    SET verified_at = NOW()
    WHERE email = ?
  `;

  await dbQuery(sql, [email], connection);
}

async function deleteVerificationByEmail(email, connection = null) {
  const sql = `
    DELETE FROM email_verification_tokens
    WHERE email = ?
  `;

  await dbQuery(sql, [email], connection);
}

async function sendVerificationCodeEmail({ email, code }) {
  const html = buildVerificationCodeEmail({
    code,
    expiresMinutes: VERIFICATION_CODE_EXPIRES_MINUTES,
  });

  await sendEmail({
    from: EMAIL_FROM || EMAIL_USER,
    to: email,
    subject: "[VitaCore] 이메일 인증 코드",
    html,
  });
}

async function createAndSendVerificationCode({ email, subject }) {
  const code = generateVerificationCode();
  const tokenHash = await bcrypt.hash(code, VERIFICATION_CODE_SALT_ROUNDS);
  const expiresAt = createExpiresAt(VERIFICATION_CODE_EXPIRES_MINUTES);

  await upsertVerificationToken({
    email,
    tokenHash,
    expiresAt,
  });

  await sendEmail({
    from: EMAIL_FROM || EMAIL_USER,
    to: email,
    subject,
    html: buildVerificationCodeEmail({
      code,
      expiresMinutes: VERIFICATION_CODE_EXPIRES_MINUTES,
    }),
  });
}

async function assertValidVerificationCode({ email, code, connection = null }) {
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

async function requestVerification({ email, ipAddress }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    await logSecurityEvent({
      userId: existingUser.id,
      eventType: "REQUEST_VERIFICATION_FAILED_DUPLICATE_EMAIL",
      targetType: "user",
      targetId: existingUser.id,
      description: `이미 가입된 이메일로 인증 요청: ${email}`,
      ipAddress,
    });

    throw createError("이미 사용 중인 이메일입니다.", 409, {
      code: "DUPLICATE_EMAIL",
    });
  }

  const code = generateVerificationCode();
  const tokenHash = await bcrypt.hash(code, VERIFICATION_CODE_SALT_ROUNDS);
  const expiresAt = createExpiresAt(VERIFICATION_CODE_EXPIRES_MINUTES);

  await upsertVerificationToken({
    email,
    tokenHash,
    expiresAt,
  });

  try {
    await sendVerificationCodeEmail({
      email,
      code,
    });
  } catch (err) {
    await logSecurityEvent({
      eventType: "REQUEST_VERIFICATION_EMAIL_SEND_FAILED",
      description: `인증 코드 메일 발송 실패: ${email}`,
      ipAddress,
    });

    throw createError("인증 코드 이메일 발송에 실패했습니다.", 500, {
      code: "VERIFICATION_EMAIL_SEND_FAILED",
    });
  }

  await logSecurityEvent({
    eventType: "REQUEST_VERIFICATION_SUCCESS",
    description: `인증 코드 발송 성공: ${email}`,
    ipAddress,
  });

  return {
    message: "이메일 인증 코드가 전송되었습니다.",
  };
}

async function verifyEmail({ email, code, ipAddress }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const verification = await findVerificationByEmail(email, connection);

    if (!verification) {
      await logSecurityEvent({
        eventType: "VERIFY_EMAIL_FAILED_NOT_FOUND",
        description: `인증 요청이 존재하지 않음: ${email}`,
        ipAddress,
      });

      throw createError("인증 요청이 존재하지 않습니다.", 400, {
        code: "VERIFICATION_NOT_FOUND",
      });
    }

    if (verification.verified_at) {
      await logSecurityEvent({
        eventType: "VERIFY_EMAIL_FAILED_ALREADY_VERIFIED",
        description: `이미 인증 완료된 이메일 재인증 시도: ${email}`,
        ipAddress,
      });

      throw createError("이미 이메일 인증이 완료되었습니다.", 400, {
        code: "EMAIL_ALREADY_VERIFIED",
      });
    }

    if (isExpired(verification.expires_at)) {
      await logSecurityEvent({
        eventType: "VERIFY_EMAIL_FAILED_EXPIRED",
        description: `만료된 인증 코드 사용: ${email}`,
        ipAddress,
      });

      throw createError("인증 코드가 만료되었습니다.", 400, {
        code: "VERIFICATION_CODE_EXPIRED",
      });
    }

    const isMatch = await bcrypt.compare(code, verification.token_hash);

    if (!isMatch) {
      await logSecurityEvent({
        eventType: "VERIFY_EMAIL_FAILED_CODE_MISMATCH",
        description: `잘못된 인증 코드 입력: ${email}`,
        ipAddress,
      });

      throw createError("인증 코드가 일치하지 않습니다.", 400, {
        code: "INVALID_VERIFICATION_CODE",
      });
    }

    await markVerificationComplete(email, connection);
    await connection.commit();

    await logSecurityEvent({
      eventType: "VERIFY_EMAIL_SUCCESS",
      description: `이메일 인증 완료: ${email}`,
      ipAddress,
    });

    return {
      message: "이메일 인증이 완료되었습니다.",
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function sendFindEmailCode({ name, email, ipAddress }) {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail) {
    throw createError("이름과 이메일을 입력해 주세요.", 400, {
      code: "FIND_EMAIL_INPUT_REQUIRED",
    });
  }

  const user = await findActiveUserByNameAndEmail({
    name: normalizedName,
    email: normalizedEmail,
  });

  if (!user) {
    await logSecurityEvent({
      eventType: "FIND_EMAIL_FAILED_NOT_FOUND",
      description: "일치하는 계정 없이 이메일 찾기 인증 요청",
      ipAddress,
    });

    throw createError("일치하는 계정을 찾을 수 없습니다.", 404, {
      code: "ACCOUNT_NOT_FOUND",
    });
  }

  await createAndSendVerificationCode({
    email: normalizedEmail,
    subject: "[VitaCore] 이메일 찾기 인증 코드",
  });

  await logSecurityEvent({
    userId: user.id,
    eventType: "FIND_EMAIL_CODE_SENT",
    targetType: "user",
    targetId: user.id,
    description: "이메일 찾기 인증 코드 발송",
    ipAddress,
  });

  return {
    message: "인증 코드가 전송되었습니다.",
  };
}

async function verifyFindEmail({ name, email, code, ipAddress }) {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const user = await findActiveUserByNameAndEmail(
      {
        name: normalizedName,
        email: normalizedEmail,
      },
      connection
    );

    if (!user) {
      await logSecurityEvent({
        eventType: "FIND_EMAIL_FAILED_NOT_FOUND",
        description: "일치하는 계정 없이 이메일 찾기 인증 확인",
        ipAddress,
      });

      throw createError("일치하는 계정을 찾을 수 없습니다.", 404, {
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    await assertValidVerificationCode({
      email: normalizedEmail,
      code,
      connection,
    });

    await deleteVerificationByEmail(normalizedEmail, connection);
    await connection.commit();

    await logSecurityEvent({
      userId: user.id,
      eventType: "FIND_EMAIL_SUCCESS",
      targetType: "user",
      targetId: user.id,
      description: "이메일 찾기 인증 완료",
      ipAddress,
    });

    return {
      message: "인증이 완료되었습니다.",
      maskedEmail: maskEmail(user.email),
    };
  } catch (err) {
    await connection.rollback();
    if (!err.statusCode || err.statusCode >= 500) {
      await logSecurityEvent({
        eventType: "FIND_EMAIL_FAILED",
        description: "이메일 찾기 처리 실패",
        ipAddress,
      });
    }
    throw err;
  } finally {
    connection.release();
  }
}

async function sendPublicPasswordResetCode({ email, ipAddress }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw createError("이메일을 입력해 주세요.", 400, {
      code: "EMAIL_REQUIRED",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.is_active) {
    await logSecurityEvent({
      eventType: "PASSWORD_RESET_FAILED_USER_NOT_FOUND",
      description: "가입되지 않은 이메일로 비밀번호 초기화 요청",
      ipAddress,
    });

    throw createError("가입되지 않은 이메일입니다.", 404, {
      code: "USER_NOT_FOUND",
    });
  }

  await createAndSendVerificationCode({
    email: normalizedEmail,
    subject: "[VitaCore] 비밀번호 초기화 인증 코드",
  });

  await logSecurityEvent({
    userId: user.id,
    eventType: "PASSWORD_RESET_CODE_SENT",
    targetType: "user",
    targetId: user.id,
    description: "로그인 전 비밀번호 초기화 인증 코드 발송",
    ipAddress,
  });

  return {
    message: "비밀번호 초기화 인증 코드가 전송되었습니다.",
  };
}

async function confirmPublicPasswordReset({
  email,
  code,
  newPassword,
  ipAddress,
}) {
  const normalizedEmail = normalizeEmail(email);

  if (typeof newPassword !== "string" || newPassword.trim().length < 8) {
    throw createError("새 비밀번호는 8자 이상이어야 합니다.", 400, {
      code: "INVALID_PASSWORD",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const user = await findUserByEmail(normalizedEmail, connection);
    if (!user || !user.is_active) {
      throw createError("가입되지 않은 이메일입니다.", 404, {
        code: "USER_NOT_FOUND",
      });
    }

    await assertValidVerificationCode({
      email: normalizedEmail,
      code,
      connection,
    });

    const passwordHash = await bcrypt.hash(
      newPassword.trim(),
      PASSWORD_SALT_ROUNDS
    );

    await dbQuery(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, user.id],
      connection
    );
    await deleteVerificationByEmail(normalizedEmail, connection);
    await connection.commit();

    await logSecurityEvent({
      userId: user.id,
      eventType: "PASSWORD_RESET_SUCCESS",
      targetType: "user",
      targetId: user.id,
      description: "로그인 전 비밀번호 변경 완료",
      ipAddress,
    });

    return {
      message: "비밀번호가 변경되었습니다.",
    };
  } catch (err) {
    await connection.rollback();
    await logSecurityEvent({
      eventType: "PASSWORD_RESET_FAILED",
      description: "로그인 전 비밀번호 변경 실패",
      ipAddress,
    });
    throw err;
  } finally {
    connection.release();
  }
}

async function signup({ name, email, password, ipAddress }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const existingUser = await findUserByEmail(email, connection);

    if (existingUser) {
      await logSecurityEvent({
        userId: existingUser.id,
        eventType: "SIGNUP_FAILED_DUPLICATE_EMAIL",
        targetType: "user",
        targetId: existingUser.id,
        description: `중복 이메일 회원가입 시도: ${email}`,
        ipAddress,
      });

      throw createError("이미 사용 중인 이메일입니다.", 409, {
        code: "DUPLICATE_EMAIL",
      });
    }

    const verification = await findVerificationByEmail(email, connection);

    if (!verification || !verification.verified_at) {
      await logSecurityEvent({
        eventType: "SIGNUP_FAILED_EMAIL_NOT_VERIFIED",
        description: `이메일 인증 없이 회원가입 시도: ${email}`,
        ipAddress,
      });

      throw createError("이메일 인증이 필요합니다.", 403, {
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (isExpired(verification.expires_at)) {
      await logSecurityEvent({
        eventType: "SIGNUP_FAILED_VERIFICATION_EXPIRED",
        description: `만료된 인증 상태로 회원가입 시도: ${email}`,
        ipAddress,
      });

      throw createError("이메일 인증이 만료되었습니다. 다시 인증해주세요.", 400, {
        code: "VERIFICATION_EXPIRED",
      });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    const insertUserSql = `
      INSERT INTO users (name, email, email_verified, password_hash)
      VALUES (?, ?, 1, ?)
    `;

    const insertResult = await dbQuery(
      insertUserSql,
      [name, email, passwordHash],
      connection
    );

    await deleteVerificationByEmail(email, connection);
    await connection.commit();

    await logSecurityEvent({
      userId: insertResult.insertId,
      eventType: "SIGNUP_SUCCESS",
      targetType: "user",
      targetId: insertResult.insertId,
      description: `회원가입 성공: ${email}`,
      ipAddress,
    });

    return {
      message: "회원가입이 완료되었습니다.",
      userId: insertResult.insertId,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function login({ email, password, ipAddress }) {
  const user = await findUserByEmail(email);

  if (!user) {
    await logSecurityEvent({
      eventType: "LOGIN_FAILED_USER_NOT_FOUND",
      description: `존재하지 않는 이메일 로그인 시도: ${email}`,
      ipAddress,
    });

    throw createError("존재하지 않는 이메일입니다.", 401, {
      code: "USER_NOT_FOUND",
    });
  }

  if (!user.is_active) {
    await logSecurityEvent({
      userId: user.id,
      eventType: "LOGIN_FAILED_INACTIVE_USER",
      targetType: "user",
      targetId: user.id,
      description: "비활성화된 계정 로그인 시도",
      ipAddress,
    });

    throw createError("비활성화된 계정입니다.", 403, {
      code: "INACTIVE_USER",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    await logSecurityEvent({
      userId: user.id,
      eventType: "LOGIN_FAILED_WRONG_PASSWORD",
      targetType: "user",
      targetId: user.id,
      description: "비밀번호 불일치 로그인 시도",
      ipAddress,
    });

    throw createError("비밀번호가 일치하지 않습니다.", 401, {
      code: "WRONG_PASSWORD",
    });
  }

  const token = createAccessToken(user);

  const updateLoginSql = `
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = ?
  `;

  await dbQuery(updateLoginSql, [user.id]);

  await logSecurityEvent({
    userId: user.id,
    eventType: "LOGIN_SUCCESS",
    targetType: "user",
    targetId: user.id,
    description: "로그인 성공",
    ipAddress,
  });

  return {
    message: "로그인에 성공했습니다.",
    token,
    user: toUserResponse(user),
  };
}

async function getMe({ userId }) {
  const user = await findUserById(userId);

  if (!user || !user.is_active) {
    throw createError("Unauthorized", 401, {
      code: "UNAUTHORIZED",
    });
  }

  return {
    user: toUserResponse(user),
  };
}

module.exports = {
  requestVerification,
  verifyEmail,
  sendFindEmailCode,
  verifyFindEmail,
  sendPublicPasswordResetCode,
  confirmPublicPasswordReset,
  signup,
  login,
  getMe,
};
