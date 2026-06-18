const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const authenticateDeviceToken = require("../middlewares/deviceAuthMiddleware");
const measurementController = require("../controllers/measurementController");
const {
  validateCreateMeasurement,
  validateCreateMeasurementBatch,
  validateCharacterId,
  validateManualCorrection,
} = require("../validators/measurementValidator");

const router = express.Router();

router.post(
  "/measurements",
  authenticateDeviceToken,
  validateCreateMeasurement,
  measurementController.createMeasurement
);
router.post(
  "/measurements/batch",
  authenticateDeviceToken,
  validateCreateMeasurementBatch,
  measurementController.createMeasurementBatch
);
router.post(
  "/measurements/manual-correction",
  authenticateToken,
  validateManualCorrection,
  measurementController.createManualCorrection
);
router.get(
  "/characters/:id/vitals/latest",
  authenticateToken,
  validateCharacterId,
  measurementController.getLatestVitals
);
router.get(
  "/characters/:id/vitals/history",
  authenticateToken,
  validateCharacterId,
  measurementController.getVitalHistory
);
router.get(
  "/characters/:id/measurements/latest",
  authenticateToken,
  validateCharacterId,
  measurementController.getLatestMeasurement
);
router.get(
  "/characters/:id/measurements",
  authenticateToken,
  validateCharacterId,
  measurementController.getMeasurementHistory
);

module.exports = router;
