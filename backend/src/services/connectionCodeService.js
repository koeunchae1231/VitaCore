const crypto = require("crypto");
const dbQuery = require("../utils/dbQuery");
const createError = require("../utils/createError");
const { logSecurityEvent } = require("./securityEventService");

function generateConnectionCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, chars.length);
    code += chars[index];
  }

  return code;
}

async function findOwnedCharacter(characterId, userId) {
  const sql = `
    SELECT id, name, age, gender, height, weight
    FROM characters
    WHERE id = ? AND user_id = ?
  `;

  const results = await dbQuery(sql, [characterId, userId]);

  if (results.length === 0) {
    throw createError("해당 캐릭터를 찾을 수 없습니다.", 404, {
      code: "CHARACTER_NOT_FOUND",
    });
  }

  return results[0];
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function toCharacterResponse(row) {
  return {
    id: row.character_id || row.id,
    name: row.character_name || row.name,
    age: row.character_age ?? row.age,
    gender: row.character_gender || row.gender,
    height: row.character_height ?? row.height,
    weight: row.character_weight ?? row.weight,
  };
}

function toDeviceResponse(row) {
  if (!row.device_id) return null;

  return {
    id: row.device_id,
    deviceName: row.device_name,
    deviceIdentifier: row.device_identifier,
    isActive: Boolean(row.device_is_active),
    connectedAt: toIso(row.device_created_at),
    lastActiveAt: toIso(row.device_last_active_at),
  };
}

function toConnectionCodeResponse(row) {
  const device = toDeviceResponse(row);
  const expiresAt = toIso(row.expires_at);
  const createdAt = row.created_at
    ? toIso(row.created_at)
    : toIso(new Date(new Date(row.expires_at).getTime() - 5 * 60 * 1000));

  return {
    code: row.code,
    characterId: row.character_id,
    character: toCharacterResponse(row),
    createdAt,
    expiresAt,
    usedAt: toIso(row.used_at),
    isUsed: Boolean(row.is_used),
    isConnected: Boolean(row.is_used && device?.isActive),
    device,
  };
}

async function getOwnedConnectionCodeByCode({ userId, code }) {
  const sql = `
    SELECT
      cc.code,
      cc.character_id,
      cc.expires_at,
      cc.used_at,
      cc.is_used,
      c.name AS character_name,
      c.age AS character_age,
      c.gender AS character_gender,
      c.height AS character_height,
      c.weight AS character_weight,
      d.id AS device_id,
      d.device_name,
      d.device_identifier,
      d.created_at AS device_created_at,
      d.last_active_at AS device_last_active_at,
      d.is_active AS device_is_active
    FROM connection_codes cc
    INNER JOIN characters c ON cc.character_id = c.id
    LEFT JOIN app_devices d ON d.id = (
      SELECT latest_device.id
      FROM app_devices latest_device
      WHERE latest_device.character_id = cc.character_id
      ORDER BY latest_device.is_active DESC,
        latest_device.last_active_at DESC,
        latest_device.id DESC
      LIMIT 1
    )
    WHERE cc.code = ? AND c.user_id = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [code, userId]);

  if (results.length === 0) {
    throw createError("Connection code not found.", 404, {
      code: "CONNECTION_CODE_NOT_FOUND",
    });
  }

  return toConnectionCodeResponse(results[0]);
}

async function expireActiveConnectionCodes(characterId) {
  const expireCodesSql = `
    UPDATE connection_codes
    SET expires_at = NOW()
    WHERE character_id = ?
      AND is_used = FALSE
      AND expires_at > NOW()
  `;

  await dbQuery(expireCodesSql, [characterId]);
}

async function createUniqueConnectionCode(characterId, attempt = 0) {
  if (attempt >= 5) {
    throw createError("연결 코드 생성 시도가 너무 많이 실패했습니다.", 500, {
      code: "CONNECTION_CODE_GENERATION_FAILED",
    });
  }

  const code = generateConnectionCode(8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const insertCodeSql = `
    INSERT INTO connection_codes (code, character_id, expires_at, is_used)
    VALUES (?, ?, ?, FALSE)
  `;

  try {
    await dbQuery(insertCodeSql, [code, characterId, expiresAt]);
    return { code, expiresAt };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return createUniqueConnectionCode(characterId, attempt + 1);
    }
    throw err;
  }
}

async function createConnectionCode({ userId, characterId, ipAddress }) {
  const parsedCharacterId = characterId;

  await findOwnedCharacter(parsedCharacterId, userId);
  await expireActiveConnectionCodes(parsedCharacterId);

  const codeData = await createUniqueConnectionCode(parsedCharacterId);

  await logSecurityEvent({
    userId,
    eventType: "CONNECTION_CODE_CREATED",
    targetType: "character",
    targetId: parsedCharacterId,
    description: "연결 코드가 생성되었습니다.",
    ipAddress,
  });

  return {
    message: "연결 코드가 생성되었습니다.",
    ...(await getOwnedConnectionCodeByCode({ userId, code: codeData.code })),
  };
}

async function getConnectionCode({ userId, code }) {
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!normalizedCode) {
    throw createError("Invalid connection code.", 400, {
      code: "INVALID_CONNECTION_CODE",
    });
  }

  return getOwnedConnectionCodeByCode({ userId, code: normalizedCode });
}

async function verifyConnectionCode({
  code,
  deviceIdentifier,
  deviceName,
  ipAddress,
}) {

  const upperCode = code;

  const verifyCodeSql = `
    SELECT
      cc.code,
      cc.character_id,
      cc.expires_at,
      cc.is_used,
      c.user_id
    FROM connection_codes cc
    INNER JOIN characters c ON cc.character_id = c.id
    WHERE cc.code = ?
  `;

  const results = await dbQuery(verifyCodeSql, [upperCode]);

  if (results.length === 0) {
    await logSecurityEvent({
      eventType: "CONNECTION_CODE_VERIFY_FAILED_INVALID",
      description: "유효하지 않은 연결 코드 검증 시도",
      ipAddress,
    });

    throw createError("유효하지 않은 연결 코드입니다.", 404, {
      code: "INVALID_CONNECTION_CODE",
    });
  }

  const connectionCode = results[0];
  const now = new Date();

  if (connectionCode.is_used) {
    await logSecurityEvent({
      userId: connectionCode.user_id,
      eventType: "CONNECTION_CODE_VERIFY_FAILED_ALREADY_USED",
      targetType: "character",
      targetId: connectionCode.character_id,
      description: "이미 사용된 연결 코드 검증 시도",
      ipAddress,
    });

    throw createError("이미 사용된 연결 코드입니다.", 400, {
      code: "CONNECTION_CODE_ALREADY_USED",
    });
  }

  if (new Date(connectionCode.expires_at) < now) {
    await logSecurityEvent({
      userId: connectionCode.user_id,
      eventType: "CONNECTION_CODE_VERIFY_FAILED_EXPIRED",
      targetType: "character",
      targetId: connectionCode.character_id,
      description: "만료된 연결 코드 검증 시도",
      ipAddress,
    });

    throw createError("만료된 연결 코드입니다.", 400, {
      code: "CONNECTION_CODE_EXPIRED",
    });
  }

  const updateCodeSql = `
    UPDATE connection_codes
    SET is_used = TRUE, used_at = NOW()
    WHERE code = ? AND is_used = FALSE
  `;

  const updateResult = await dbQuery(updateCodeSql, [upperCode]);

  if (updateResult.affectedRows === 0) {
    throw createError("이미 사용된 연결 코드입니다.", 400, {
      code: "CONNECTION_CODE_ALREADY_USED",
    });
  }

  const upsertDeviceSql = `
    INSERT INTO app_devices (
      character_id,
      device_name,
      device_identifier,
      created_at,
      updated_at,
      last_active_at,
      is_active
    )
    VALUES (?, ?, ?, NOW(), NOW(), NOW(), TRUE)
    ON DUPLICATE KEY UPDATE
      character_id = VALUES(character_id),
      device_name = VALUES(device_name),
      updated_at = NOW(),
      last_active_at = NOW(),
      is_active = TRUE
  `;

  await dbQuery(upsertDeviceSql, [
    connectionCode.character_id,
    deviceName,
    deviceIdentifier,
  ]);

  await logSecurityEvent({
    userId: connectionCode.user_id,
    eventType: "CONNECTION_CODE_USED",
    targetType: "character",
    targetId: connectionCode.character_id,
    description: "연결 코드가 사용되었습니다.",
    ipAddress,
  });

  await logSecurityEvent({
    userId: connectionCode.user_id,
    eventType: "DEVICE_CONNECTED",
    targetType: "character",
    targetId: connectionCode.character_id,
    description: "기기가 연결되었습니다.",
    ipAddress,
  });

  return {
    message: "연결에 성공했습니다.",
    characterId: connectionCode.character_id,
  };
}

async function getConnectionStatus({ userId, characterId }) {
  const parsedCharacterId = Number(characterId);

  if (!Number.isInteger(parsedCharacterId) || parsedCharacterId <= 0) {
    throw createError("Invalid characterId.", 400, {
      code: "INVALID_CHARACTER_ID",
    });
  }

  const character = await findOwnedCharacter(parsedCharacterId, userId);

  const sql = `
    SELECT
      id,
      device_name,
      device_identifier,
      created_at,
      last_active_at,
      is_active
    FROM app_devices
    WHERE character_id = ?
    ORDER BY is_active DESC, last_active_at DESC, id DESC
    LIMIT 1
  `;

  const results = await dbQuery(sql, [parsedCharacterId]);
  const device = results[0] || null;

  if (!device || !device.is_active) {
    return {
      characterId: parsedCharacterId,
      character,
      isConnected: false,
      device: null,
      display: {
        status: "disconnected",
        label: "NOT CONNECTED",
        lastSync: null,
      },
    };
  }

  return {
    characterId: parsedCharacterId,
    character,
    isConnected: true,
    device: {
      id: device.id,
      deviceIdentifier: device.device_identifier,
      deviceName: device.device_name,
      isActive: Boolean(device.is_active),
      connectedAt: device.created_at
        ? new Date(device.created_at).toISOString()
        : null,
      lastActiveAt: device.last_active_at
        ? new Date(device.last_active_at).toISOString()
        : null,
    },
    display: {
      status: "connected",
      label: "YOU ARE CONNECTED!",
      lastSync: device.last_active_at
        ? new Date(device.last_active_at).toISOString()
        : null,
    },
  };
}

module.exports = {
  createConnectionCode,
  getConnectionCode,
  verifyConnectionCode,
  getConnectionStatus,
};
