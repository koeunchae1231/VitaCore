const crypto = require("crypto");

function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  hashVerificationToken,
  generateVerificationToken,
};