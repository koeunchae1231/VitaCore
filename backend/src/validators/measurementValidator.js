const createError = require("../utils/createError");

function validateCreateMeasurement(req, res, next) {
  try {
    let { deviceIdentifier, vitalType, value, measuredAt } = req.body;

    if (!vitalType || value === undefined) {
      throw createError("vitalType and value are required.", 400);
    }

    deviceIdentifier =
      deviceIdentifier === undefined || deviceIdentifier === null
        ? null
        : String(deviceIdentifier).trim();
    vitalType = String(vitalType).trim().toUpperCase();
    value = Number(value);

    if (!vitalType || Number.isNaN(value)) {
      throw createError("Invalid measurement input.", 400);
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

    req.body.deviceIdentifier = deviceIdentifier;
    req.body.vitalType = vitalType;
    req.body.value = value;
    req.body.measuredAt = measuredAt;

    next();
  } catch (err) {
    next(err);
  }
}

function validateCreateMeasurementBatch(req, res, next) {
  try {
    const measurements = Array.isArray(req.body.measurements)
      ? req.body.measurements
      : null;

    if (!measurements || measurements.length === 0) {
      throw createError("measurements array is required.", 400, {
        code: "INVALID_MEASUREMENT_BATCH",
      });
    }

    if (measurements.length > 500) {
      throw createError("Batch size must be 500 or less.", 400, {
        code: "MEASUREMENT_BATCH_TOO_LARGE",
      });
    }

    req.body.measurements = measurements.map((measurement) => {
      let { vitalType, value, measuredAt } = measurement;

      vitalType = String(vitalType || "").trim().toUpperCase();
      value = Number(value);

      if (!vitalType || Number.isNaN(value)) {
        throw createError("Each measurement requires vitalType and value.", 400, {
          code: "INVALID_MEASUREMENT_BATCH_ITEM",
        });
      }

      const parsedMeasuredAt = new Date(measuredAt);
      if (!measuredAt || Number.isNaN(parsedMeasuredAt.getTime())) {
        throw createError("Each measurement requires a valid measuredAt.", 400, {
          code: "INVALID_MEASURED_AT",
        });
      }

      return {
        vitalType,
        value,
        measuredAt: parsedMeasuredAt,
      };
    });

    next();
  } catch (err) {
    next(err);
  }
}

function validateCharacterId(req, res, next) {
  try {
    const id = Number(req.params.characterId ?? req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError("Invalid character id.", 400);
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
  validateCreateMeasurementBatch,
  validateCharacterId,
  validateManualCorrection,
};
