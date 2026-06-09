const measurementService = require("../services/measurementService");

async function createMeasurement(req, res, next) {
  try {
    const result = await measurementService.createMeasurement({
      deviceIdentifier: req.body.deviceIdentifier,
      vitalType: req.body.vitalType,
      value: req.body.value,
      ipAddress: req.ip,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getLatestMeasurement(req, res, next) {
  try {
    const result = await measurementService.getLatestMeasurement({
      userId: req.user.userId,
      characterId: req.params.id,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMeasurementHistory(req, res, next) {
  try {
    const result = await measurementService.getMeasurementHistory({
      userId: req.user.userId,
      characterId: req.params.id,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getLatestVitals(req, res, next) {
  try {
    const result = await measurementService.getLatestVitals({
      userId: req.user.userId,
      characterId: req.params.id,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getVitalHistory(req, res, next) {
  try {
    const result = await measurementService.getVitalHistory({
      userId: req.user.userId,
      characterId: req.params.id,
      filters: req.query,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function createManualCorrection(req, res, next) {
  try {
    const result = await measurementService.createManualCorrection({
      userId: req.user.userId,
      characterId: req.body.characterId,
      vitalType: req.body.vitalType,
      value: req.body.value,
      measuredAt: req.body.measuredAt,
      reason: req.body.reason,
      sourceType: req.body.sourceType,
      ipAddress: req.ip,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMeasurement,
  getLatestMeasurement,
  getMeasurementHistory,
  getLatestVitals,
  getVitalHistory,
  createManualCorrection,
};
