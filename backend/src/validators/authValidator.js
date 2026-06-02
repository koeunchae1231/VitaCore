// backend/src/validators/authValidator.js
const createError = require("../utils/createError");

function validateRequestVerificationInput(req, res, next) {
  try {
    let { email } = req.body;

    if (email === undefined) {
      throw createError("이메일을 입력하세요.", 400, {
        code: "INVALID_REQUEST_VERIFICATION_INPUT",
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      throw createError("이메일은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_REQUEST_VERIFICATION_EMAIL",
      });
    }

    email = email.trim().toLowerCase();
    req.body.email = email;

    next();
  } catch (err) {
    next(err);
  }
}

function validateVerifyEmailInput(req, res, next) {
  try {
    let { email, code } = req.body;

    if (email === undefined || code === undefined) {
      throw createError("이메일과 인증 코드를 입력하세요.", 400, {
        code: "INVALID_VERIFY_EMAIL_INPUT",
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      throw createError("이메일은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_VERIFY_EMAIL_EMAIL",
      });
    }

    if (typeof code !== "string" || !code.trim()) {
      throw createError("인증 코드는 비어 있을 수 없습니다.", 400, {
        code: "INVALID_VERIFY_EMAIL_CODE",
      });
    }

    email = email.trim().toLowerCase();
    code = code.trim();

    req.body.email = email;
    req.body.code = code;

    next();
  } catch (err) {
    next(err);
  }
}

function validateSignupInput(req, res, next) {
  try {
    let { name, email, password } = req.body;

    if (name === undefined || email === undefined || password === undefined) {
      throw createError("이름, 이메일, 비밀번호를 모두 입력하세요.", 400, {
        code: "INVALID_SIGNUP_INPUT",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      throw createError("이름은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_SIGNUP_NAME",
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      throw createError("이메일은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_SIGNUP_EMAIL",
      });
    }

    if (typeof password !== "string" || !password.trim()) {
      throw createError("비밀번호는 비어 있을 수 없습니다.", 400, {
        code: "INVALID_SIGNUP_PASSWORD",
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    req.body.name = name;
    req.body.email = email;
    req.body.password = password;

    next();
  } catch (err) {
    next(err);
  }
}

function validateLoginInput(req, res, next) {
  try {
    let { email, password } = req.body;

    if (email === undefined || password === undefined) {
      throw createError("이메일과 비밀번호를 입력하세요.", 400, {
        code: "INVALID_LOGIN_INPUT",
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      throw createError("이메일은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_LOGIN_EMAIL",
      });
    }

    if (typeof password !== "string" || !password.trim()) {
      throw createError("비밀번호는 비어 있을 수 없습니다.", 400, {
        code: "INVALID_LOGIN_PASSWORD",
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    req.body.email = email;
    req.body.password = password;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateRequestVerificationInput,
  validateVerifyEmailInput,
  validateSignupInput,
  validateLoginInput,
};