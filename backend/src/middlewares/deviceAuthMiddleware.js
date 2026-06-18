const { verifyDeviceToken } = require("../services/deviceTokenService");

function authenticateDeviceToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Device token is required.",
      code: "DEVICE_TOKEN_REQUIRED",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid device token format.",
      code: "INVALID_DEVICE_TOKEN_FORMAT",
    });
  }

  try {
    req.device = verifyDeviceToken(token);
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid device token.",
      code: "INVALID_DEVICE_TOKEN",
    });
  }
}

module.exports = authenticateDeviceToken;
