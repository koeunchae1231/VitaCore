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
router.delete(
  "/devices/:deviceId",
  authenticateToken,
  connectionCodeController.revokeDevice
);

module.exports = router;
