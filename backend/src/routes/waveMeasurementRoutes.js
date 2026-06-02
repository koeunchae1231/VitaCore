// backend/src/routes/waveMeasurementRoutes.js
const express = require("express");

const authenticateToken = require("../middlewares/authMiddleware");
const waveMeasurementController = require("../controllers/waveMeasurementController");

const {
  validateCreateWaveMeasurement,
  validateMeasurementIdParam,
} = require("../validators/waveMeasurementValidator");

const router = express.Router();

// 파형 저장 (디바이스 → 서버)
router.post(
  "/wave-measurements",
  validateCreateWaveMeasurement,
  waveMeasurementController.createWaveMeasurement
);

// 특정 measurement의 파형 목록 조회
router.get(
  "/measurements/:measurementId/waves",
  authenticateToken,
  validateMeasurementIdParam,
  waveMeasurementController.getWavesByMeasurement
);

// 특정 measurement의 최신 파형 조회
router.get(
  "/measurements/:measurementId/waves/latest",
  authenticateToken,
  validateMeasurementIdParam,
  waveMeasurementController.getLatestWaveByMeasurement
);

module.exports = router;