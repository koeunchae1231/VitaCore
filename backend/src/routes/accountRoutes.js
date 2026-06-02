const express = require("express");
const accountController = require("../controllers/accountController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/delete", accountController.deleteAccount);
router.post("/email/send-code", accountController.sendEmailChangeCode);
router.post("/email/change", accountController.changeEmail);
router.post("/password/send-code", accountController.sendPasswordResetCode);
router.post("/password/reset", accountController.resetPassword);

module.exports = router;
