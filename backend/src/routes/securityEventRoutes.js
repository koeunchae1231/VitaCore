const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const securityEventController = require("../controllers/securityEventController");

const router = express.Router();

router.post(
  "/security-events",
  authenticateToken,
  securityEventController.createClientSecurityEvent
);

router.get(
  "/characters/:id/security-events",
  authenticateToken,
  securityEventController.getCharacterEvents
);

router.post(
  "/security-events/archive",
  authenticateToken,
  securityEventController.archiveSecurityEvents
);

module.exports = router;
