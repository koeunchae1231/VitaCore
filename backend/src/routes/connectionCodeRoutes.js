// backend/src/routes/connectionCodeRoutes.js
const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const connectionCodeController = require("../controllers/connectionCodeController");
const {
  validateCreateConnectionCode,
  validateVerifyConnectionCode,
} = require("../validators/connectionCodeValidator");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  validateCreateConnectionCode,
  connectionCodeController.createConnectionCode
);
router.get(
  "/:code",
  authenticateToken,
  connectionCodeController.getConnectionCode
);
router.post(
  "/verify",
  validateVerifyConnectionCode,
  connectionCodeController.verifyConnectionCode
);

module.exports = router;
