const createError = require("../utils/createError");

function validateCreateConnectionCode(req, res, next) {
  try {
    const { characterId } = req.body;

    const parsed = Number(characterId);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw createError("유효한 characterId를 입력하세요.", 400, {
        code: "INVALID_CHARACTER_ID",
      });
    }

    req.body.characterId = parsed;

    next();
  } catch (err) {
    next(err);
  }
}

function validateVerifyConnectionCode(req, res, next) {
  try {
    let { code, deviceIdentifier, deviceName } = req.body;

    if (!code || !deviceIdentifier) {
      throw createError("code와 deviceIdentifier는 필수입니다.", 400, {
        code: "INVALID_CONNECTION_CODE_INPUT",
      });
    }

    code = String(code).trim().toUpperCase();
    deviceIdentifier = String(deviceIdentifier).trim();
    deviceName = typeof deviceName === "string" && deviceName.trim()
      ? deviceName.trim()
      : "Unknown Device";

    req.body.code = code;
    req.body.deviceIdentifier = deviceIdentifier;
    req.body.deviceName = deviceName;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCreateConnectionCode,
  validateVerifyConnectionCode,
};
