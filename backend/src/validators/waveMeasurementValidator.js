const createError = require("../utils/createError");

function validatePositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function validatePositiveNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function normalizeWaveData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const normalized = data.map((item) => Number(item));

  if (normalized.some((item) => !Number.isFinite(item))) {
    return null;
  }

  return normalized;
}

function validateCreateWaveMeasurement(req, res, next) {
  try {
    const { measurementId, samplingRate, durationSeconds, data } = req.body;

    const parsedMeasurementId = validatePositiveInt(measurementId);
    const parsedSamplingRate = validatePositiveInt(samplingRate);
    const parsedDurationSeconds = validatePositiveNumber(durationSeconds);
    const normalizedWaveData = normalizeWaveData(data);

    if (
      !parsedMeasurementId ||
      !parsedSamplingRate ||
      !parsedDurationSeconds ||
      !normalizedWaveData
    ) {
      throw createError(
        "measurementId, samplingRate, durationSeconds, data must be valid.",
        400,
        { code: "INVALID_WAVE_MEASUREMENT_INPUT" }
      );
    }

    req.body.measurementId = parsedMeasurementId;
    req.body.samplingRate = parsedSamplingRate;
    req.body.durationSeconds = parsedDurationSeconds;
    req.body.data = normalizedWaveData;

    next();
  } catch (err) {
    next(err);
  }
}

function validateMeasurementIdParam(req, res, next) {
  try {
    const parsedMeasurementId = validatePositiveInt(req.params.measurementId);

    if (!parsedMeasurementId) {
      throw createError("Invalid measurement ID.", 400, {
        code: "INVALID_MEASUREMENT_ID",
      });
    }

    req.params.measurementId = parsedMeasurementId;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCreateWaveMeasurement,
  validateMeasurementIdParam,
};
