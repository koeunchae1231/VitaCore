// backend/src/controllers/waveMeasurementController.js
const waveMeasurementService = require("../services/waveMeasurementService");

async function createWaveMeasurement(req, res, next) {
  try {
    const result = await waveMeasurementService.createWaveMeasurement({
      measurementId: req.body.measurementId,
      samplingRate: req.body.samplingRate,
      durationSeconds: req.body.durationSeconds,
      data: req.body.data,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getWavesByMeasurement(req, res, next) {
  try {
    const result = await waveMeasurementService.getWavesByMeasurement({
      measurementId: req.params.measurementId,
      userId: req.user.userId,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getLatestWaveByMeasurement(req, res, next) {
  try {
    const result = await waveMeasurementService.getLatestWaveByMeasurement({
      measurementId: req.params.measurementId,
      userId: req.user.userId,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createWaveMeasurement,
  getWavesByMeasurement,
  getLatestWaveByMeasurement,
};
