const dbQuery = require("../utils/dbQuery");
const { logSecurityEvent } = require("./securityEventService");

const DEVICE_INACTIVE_DAYS = 30;

function isDeviceExpired(device, now = new Date()) {
  if (!device?.last_active_at) return false;

  const lastSeenAt = new Date(device.last_active_at);
  if (Number.isNaN(lastSeenAt.getTime())) return false;

  const inactiveMs = now.getTime() - lastSeenAt.getTime();
  return inactiveMs > DEVICE_INACTIVE_DAYS * 24 * 60 * 60 * 1000;
}

async function markInactiveDevices({ ipAddress = null } = {}) {
  const selectSql = `
    SELECT d.id, d.character_id, c.user_id
    FROM app_devices d
    INNER JOIN characters c ON d.character_id = c.id
    WHERE d.is_active = TRUE
      AND d.last_active_at < DATE_SUB(NOW(), INTERVAL ? DAY)
  `;

  const devices = await dbQuery(selectSql, [DEVICE_INACTIVE_DAYS]);

  if (devices.length === 0) {
    return { inactiveCount: 0 };
  }

  const ids = devices.map((device) => device.id);
  const placeholders = ids.map(() => "?").join(", ");

  await dbQuery(
    `UPDATE app_devices SET is_active = FALSE, updated_at = NOW() WHERE id IN (${placeholders})`,
    ids
  );

  await Promise.all(
    devices.map((device) =>
      logSecurityEvent({
        userId: device.user_id,
        eventType: "DEVICE_INACTIVE",
        targetType: "device",
        targetId: device.id,
        description: "30일 이상 미접속 기기가 비활성화되었습니다.",
        ipAddress,
      })
    )
  );

  return { inactiveCount: devices.length };
}

module.exports = {
  DEVICE_INACTIVE_DAYS,
  isDeviceExpired,
  markInactiveDevices,
};
