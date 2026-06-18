const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const DEVICE_TOKEN_EXPIRES_IN = process.env.DEVICE_TOKEN_EXPIRES_IN || "90d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required for device token signing.");
}

function issueDeviceToken({ deviceId, characterId, userId }) {
  return jwt.sign(
    {
      tokenType: "device",
      deviceId,
      characterId,
      userId,
    },
    JWT_SECRET,
    { expiresIn: DEVICE_TOKEN_EXPIRES_IN }
  );
}

function verifyDeviceToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.tokenType !== "device" || !decoded.deviceId || !decoded.characterId) {
    const error = new Error("Invalid device token.");
    error.name = "JsonWebTokenError";
    throw error;
  }

  return decoded;
}

module.exports = {
  issueDeviceToken,
  verifyDeviceToken,
};
