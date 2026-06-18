const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const DEVICE_TOKEN_EXPIRES_IN = process.env.DEVICE_TOKEN_EXPIRES_IN || "90d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required for device token signing.");
}

function issueDeviceToken({ deviceId, characterId, userId, jti = crypto.randomUUID() }) {
  const deviceToken = jwt.sign(
    {
      tokenType: "device",
      deviceId,
      characterId,
      userId,
      jti,
    },
    JWT_SECRET,
    { expiresIn: DEVICE_TOKEN_EXPIRES_IN }
  );

  return { deviceToken, jti };
}

function verifyDeviceToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    decoded.tokenType !== "device" ||
    !decoded.deviceId ||
    !decoded.characterId ||
    !decoded.jti
  ) {
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
