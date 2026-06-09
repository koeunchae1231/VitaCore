const express = require("express");
const authController = require("../controllers/authController");
const {
  validateRequestVerificationInput,
  validateVerifyEmailInput,
  validateSignupInput,
  validateLoginInput,
} = require("../validators/authValidator");

const router = express.Router();

router.post(
  "/request-verification",
  validateRequestVerificationInput,
  authController.requestVerification
);

router.post(
  "/verify-email",
  validateVerifyEmailInput,
  authController.verifyEmail
);

router.post("/signup", validateSignupInput, authController.signup);
router.post("/login", validateLoginInput, authController.login);
router.post("/find-email/send-code", authController.sendFindEmailCode);
router.post("/find-email/verify", authController.verifyFindEmail);
router.post(
  "/password-reset/send-code",
  authController.sendPublicPasswordResetCode
);
router.post(
  "/password-reset/confirm",
  authController.confirmPublicPasswordReset
);

module.exports = router;
