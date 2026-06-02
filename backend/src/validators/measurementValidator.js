// backend/src/validators/measurementValidator.js
const createError = require("../utils/createError");

function validateCreateMeasurement(req, res, next) {
  try {
    let { deviceIdentifier, vitalType, value } = req.body;

    if (!deviceIdentifier || !vitalType || value === undefined) {
      throw createError("deviceIdentifier, vitalType, value는 필수입니다.", 400);
    }

    deviceIdentifier = String(deviceIdentifier).trim();
    vitalType = String(vitalType).trim().toUpperCase();
    value = Number(value);

    if (!deviceIdentifier || !vitalType || Number.isNaN(value)) {
      throw createError("유효하지 않은 입력입니다.", 400);
    }

    req.body.deviceIdentifier = deviceIdentifier;
    req.body.vitalType = vitalType;
    req.body.value = value;

    next();
  } catch (err) {
    next(err);
  }
}

function validateCharacterId(req, res, next) {
  try {
    const id = Number(req.params.characterId ?? req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError("유효하지 않은 캐릭터 ID입니다.", 400);
    }

    req.params.characterId = id;
    req.params.id = id;

    next();
  } catch (err) {
    next(err);
  }
}

function validateManualCorrection(req, res, next) {
  try {
    let { characterId, vitalType, value, measuredAt, reason, sourceType } = req.body;
    const parsedCharacterId = Number(characterId);

    if (!Number.isInteger(parsedCharacterId) || parsedCharacterId <= 0) {
      throw createError("Invalid characterId.", 400, {
        code: "INVALID_CHARACTER_ID",
      });
    }

    vitalType = String(vitalType || "").trim().toUpperCase();
    value = Number(value);

    if (!vitalType || Number.isNaN(value)) {
      throw createError("vitalType and value are required.", 400, {
        code: "INVALID_MANUAL_CORRECTION_INPUT",
      });
    }

    if (measuredAt !== undefined && measuredAt !== null && measuredAt !== "") {
      const parsedMeasuredAt = new Date(measuredAt);
      if (Number.isNaN(parsedMeasuredAt.getTime())) {
        throw createError("Invalid measuredAt.", 400, {
          code: "INVALID_MEASURED_AT",
        });
      }
      measuredAt = parsedMeasuredAt;
    } else {
      measuredAt = new Date();
    }

    req.body.characterId = parsedCharacterId;
    req.body.vitalType = vitalType;
    req.body.value = value;
    req.body.measuredAt = measuredAt;
    req.body.reason =
      typeof reason === "string" && reason.trim() ? reason.trim() : null;
    sourceType = String(sourceType || "manual").trim().toLowerCase();
    req.body.sourceType =
      sourceType === "simulation" || sourceType === "manual"
        ? sourceType
        : "manual";

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCreateMeasurement,
  validateCharacterId,
  validateManualCorrection,
};
