const { verifyDeviceToken } = require("../services/deviceTokenService");
const dbQuery = require("../utils/dbQuery");

async function authenticateDeviceToken(req, res, next) {
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
    const decoded = verifyDeviceToken(token);
    const results = await dbQuery(
      `
        SELECT
          id,
          character_id,
          is_active,
          is_revoked,
          current_token_jti
        FROM app_devices
        WHERE id = ?
        LIMIT 1
      `,
      [decoded.deviceId]
    );
    const device = results[0];

    if (!device) {
      return res.status(401).json({
        message: "Device is not registered.",
        code: "DEVICE_NOT_REGISTERED",
      });
    }

    if (device.is_revoked || device.current_token_jti !== decoded.jti) {
      return res.status(403).json({
        message: "Device token has been revoked.",
        code: "DEVICE_TOKEN_REVOKED",
      });
    }

    if (!device.is_active) {
      return res.status(403).json({
        message: "Device is inactive.",
        code: "DEVICE_INACTIVE",
      });
    }

    await dbQuery(
      `
        UPDATE app_devices
        SET last_seen_at = NOW(), last_active_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `,
      [device.id]
    );

    req.device = {
      ...decoded,
      deviceId: device.id,
      characterId: device.character_id,
    };
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid device token.",
      code: "INVALID_DEVICE_TOKEN",
    });
  }
}

module.exports = authenticateDeviceToken;
