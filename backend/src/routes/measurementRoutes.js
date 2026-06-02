// backend/src/routes/measurementRoutes.js
const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const measurementController = require("../controllers/measurementController");
const {
  validateCreateMeasurement,
  validateCharacterId,
  validateManualCorrection,
} = require("../validators/measurementValidator");

const router = express.Router();

router.post(
  "/measurements",
  validateCreateMeasurement,
  measurementController.createMeasurement
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
