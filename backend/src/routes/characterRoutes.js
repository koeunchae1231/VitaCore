const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const validateCharacterInput = require("../validators/characterValidator");
const characterController = require("../controllers/characterController");
const connectionCodeController = require("../controllers/connectionCodeController");

const router = express.Router();

router.post("/", authenticateToken, validateCharacterInput, characterController.createCharacter);
router.get("/", authenticateToken, characterController.getMyCharacters);
router.get("/:id/connection-status", authenticateToken, connectionCodeController.getConnectionStatus);
router.get("/:id", authenticateToken, characterController.getCharacterById);
router.put("/:id", authenticateToken, validateCharacterInput, characterController.updateCharacter);
router.delete("/:id", authenticateToken, characterController.deleteCharacter);

module.exports = router;
