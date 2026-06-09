// backend/src/services/measurementService.js
const dbQuery = require("../utils/dbQuery");
const createError = require("../utils/createError");
const { logSecurityEvent } = require("./securityEventService");
const { isDeviceExpired, markInactiveDevices } = require("./devicePolicyService");
const {
  buildMonitor,
  getVitalUnit,
  toIso,
  toMeasurementResponse,
} = require("./measurement/measurementMapper");
const {
  deriveRrFromSpo2,
  detectMeasurementAnomaly,
} = require("./measurement/measurementRules");

const SNAPSHOT_TYPES = ["HR", "SPO2", "RR", "SBP", "DBP", "MAP", "TEMP"];
const BODY_TEMP_MIN = 34;
const BODY_TEMP_MAX = 42;

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isValidBodyTemperature(value) {
  return Number(value) >= BODY_TEMP_MIN && Number(value) <= BODY_TEMP_MAX;
}

function maskDeviceIdentifier(identifier) {
  const value = String(identifier || "");
  if (!value) return "-";
  if (value.length <= 8) return `${value.slice(0, 2)}****`;
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

async function createMeasurementEventLog({ userId, characterId, ipAddress }) {
  await logSecurityEvent({
    userId,
    eventType: "DEVICE_VITAL_UPDATED",
    targetType: "character",
    targetId: characterId,
    description: "실측 바이탈 정보가 반영되었습니다.",
    ipAddress,
  });
}

async function createDerivedVitalEventLog({ userId, characterId, ipAddress }) {
  await logSecurityEvent({
    userId,
    eventType: "DERIVED_VITAL_UPDATED",
    targetType: "character",
    targetId: characterId,
    description: "산소포화도 기반으로 호흡수가 갱신되었습니다.",
    ipAddress,
  });
}

async function createIgnoredMeasurementEventLog({
  userId,
  characterId,
  vitalCode,
  ipAddress,
}) {
  await logSecurityEvent({
    userId,
    eventType: "MEASUREMENT_IGNORED",
    targetType: "character",
    targetId: characterId,
    description:
      vitalCode === "TEMP"
        ? "비정상 체온 값이 감지되어 반영하지 않았습니다."
        : "호흡수 실측값은 정책에 따라 반영하지 않았습니다.",
    ipAddress,
  });
}

async function getLatestVitalValue(characterId, vitalCode) {
  const sql = `
    SELECT m.value
    FROM measurements m
    INNER JOIN vital_types vt ON m.vital_type_id = vt.id
    WHERE m.character_id = ? AND vt.code = ?
      AND NOT (
        vt.code = 'TEMP'
        AND (m.source_type = 'device' OR m.value < ? OR m.value > ?)
      )
    ORDER BY
      m.measured_at DESC,
      COALESCE(m.created_at, m.measured_at) DESC,
      m.id DESC
    LIMIT 1
  `;

  const results = await dbQuery(sql, [
    characterId,
    vitalCode,
    BODY_TEMP_MIN,
    BODY_TEMP_MAX,
  ]);
  return results[0]?.value;
}

async function insertMeasurementRecord({
  characterId,
  appDeviceId,
  vitalTypeId,
  value,
  measuredAt,
  sourceType,
}) {
  const insertMeasurementSql = `
    INSERT INTO measurements (
      character_id,
      app_device_id,
      vital_type_id,
      value,
      measured_at,
      source_type
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return dbQuery(insertMeasurementSql, [
    characterId,
    appDeviceId,
    vitalTypeId,
    value,
    measuredAt,
    sourceType,
  ]);
}

async function findOwnedCharacter(characterId, userId) {
  const sql = `
    SELECT id, name, age, gender, height, weight
    FROM characters
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [characterId, userId]);

  if (results.length === 0) {
    throw createError("Character not found.", 404, {
      code: "CHARACTER_NOT_FOUND",
    });
  }

  return results[0];
}

async function findVitalType(vitalType) {
  const sql = `
    SELECT id, code
    FROM vital_types
    WHERE code = ?
    LIMIT 1
  `;

  const results = await dbQuery(sql, [vitalType]);

  if (results.length === 0) {
    throw createError("Invalid vitalType.", 400, {
      code: "INVALID_VITAL_TYPE",
    });
  }

  return results[0];
}

async function createMeasurement({ deviceIdentifier, vitalType, value, ipAddress }) {
  const vitalCode = vitalType;

  await markInactiveDevices({ ipAddress });

  const findDeviceSql = `
    SELECT
      d.id,
      d.character_id,
      d.device_name,
      d.device_identifier,
      d.is_active,
      d.last_active_at,
      c.user_id
    FROM app_devices d
    INNER JOIN characters c ON d.character_id = c.id
    WHERE d.device_identifier = ?
  `;

  const deviceResults = await dbQuery(findDeviceSql, [deviceIdentifier]);

  if (deviceResults.length === 0) {
    await logSecurityEvent({
      eventType: "DEVICE_REJECTED",
      targetType: "device",
      targetId: null,
      description: "등록되지 않은 기기의 측정값 전송 거부",
      ipAddress,
    });

    throw createError("등록되지 않은 기기입니다.", 403, { code: "DEVICE_NOT_FOUND" });
  }

  const device = deviceResults[0];

  if (!device.is_active || isDeviceExpired(device)) {
    await logSecurityEvent({
      userId: device.user_id,
      eventType: "DEVICE_REJECTED",
      targetType: "device",
      targetId: device.id,
      description: "비활성 또는 만료 기기의 측정값 전송이 거부되었습니다.",
      ipAddress,
    });

    throw createError("비활성화된 기기입니다.", 403, { code: "DEVICE_INACTIVE" });
  }

  const findVitalTypeSql = `
    SELECT id, code
    FROM vital_types
    WHERE code = ?
  `;

  const vitalResults = await dbQuery(findVitalTypeSql, [vitalCode]);

  if (vitalResults.length === 0) {
    throw createError("유효하지 않은 vitalType입니다.", 400, { code: "INVALID_VITAL_TYPE" });
  }

  const vitalTypeRow = vitalResults[0];
  const measuredAt = new Date();

  if (vitalTypeRow.code === "TEMP" || vitalTypeRow.code === "RR") {
    const ignoredDescription =
      vitalTypeRow.code === "TEMP"
        ? `비정상 TEMP 값 ${value}°C 수신, 체온 데이터로 반영하지 않음. characterId=${device.character_id}, vitalCode=TEMP, value=${value}, unit=C, source_type=device, device=${device.device_name || maskDeviceIdentifier(device.device_identifier)}, measured_at=${toIso(measuredAt)}`
        : `기기 RR 측정값은 SensorKit raw RR 미사용 정책에 따라 무시되었습니다. characterId=${device.character_id}, vitalCode=RR, value=${value}, unit=breaths/min, source_type=device, device=${device.device_name || maskDeviceIdentifier(device.device_identifier)}, measured_at=${toIso(measuredAt)}`;

    await logSecurityEvent({
      userId: device.user_id,
      eventType: "MEASUREMENT_IGNORED_DETAIL",
      targetType: "measurement",
      targetId: device.id,
      description: ignoredDescription,
      ipAddress,
    });

    await createIgnoredMeasurementEventLog({
      userId: device.user_id,
      characterId: device.character_id,
      vitalCode: vitalTypeRow.code,
      ipAddress,
    });

    return {
      message: "측정값이 정책에 따라 무시되었습니다.",
      measurementId: null,
      ignored: true,
      anomalyDetected: false,
    };
  }

  const insertResult = await insertMeasurementRecord({
    characterId: device.character_id,
    appDeviceId: device.id,
    vitalTypeId: vitalTypeRow.id,
    value,
    measuredAt,
    sourceType: "device",
  });

  await dbQuery(
    `UPDATE app_devices SET last_active_at = NOW(), updated_at = NOW() WHERE id = ?`,
    [device.id]
  );

  await logSecurityEvent({
    userId: device.user_id,
    eventType: "MEASUREMENT_CREATED",
    targetType: "measurement",
    targetId: insertResult.insertId,
    description: `측정값이 저장되었습니다. vital_type=${vitalTypeRow.code}, value=${value}`,
    ipAddress,
  });

  await createMeasurementEventLog({
    userId: device.user_id,
    characterId: device.character_id,
    ipAddress,
  });

  const anomaly = detectMeasurementAnomaly(vitalTypeRow.code, value);

  if (anomaly) {
    await logSecurityEvent({
      userId: device.user_id,
      eventType: anomaly.type,
      targetType: "measurement",
      targetId: insertResult.insertId,
      description: anomaly.description,
      ipAddress,
    });
  }

  let derivedRrMeasurementId = null;
  if (vitalTypeRow.code === "SPO2") {
    const rrTypeRow = await findVitalType("RR");
    const baseRr = await getLatestVitalValue(device.character_id, "RR");
    const derivedRr = deriveRrFromSpo2(value, baseRr);

    const rrInsertResult = await insertMeasurementRecord({
      characterId: device.character_id,
      appDeviceId: device.id,
      vitalTypeId: rrTypeRow.id,
      value: derivedRr,
      measuredAt,
      sourceType: "simulation",
    });

    derivedRrMeasurementId = rrInsertResult.insertId;

    await createDerivedVitalEventLog({
      userId: device.user_id,
      characterId: device.character_id,
      ipAddress,
    });
  }

  return {
    message: "측정값 저장에 성공했습니다.",
    measurementId: insertResult.insertId,
    derivedRrMeasurementId,
    anomalyDetected: Boolean(anomaly),
  };
}

async function getLatestMeasurement({ userId, characterId }) {
  const latestSql = `
    SELECT
      m.id,
      m.character_id,
      m.app_device_id,
      m.vital_type_id,
      vt.code AS vital_type,
      m.value,
      m.source_type,
      m.measured_at AS measurement_timestamp
    FROM measurements m
    INNER JOIN characters c ON m.character_id = c.id
    INNER JOIN vital_types vt ON m.vital_type_id = vt.id
    WHERE m.character_id = ? AND c.user_id = ?
      AND NOT (
        vt.code = 'TEMP'
        AND (m.source_type = 'device' OR m.value < ? OR m.value > ?)
      )
    ORDER BY
      m.measured_at DESC,
      COALESCE(m.created_at, m.measured_at) DESC,
      m.id DESC
    LIMIT 1
  `;

  const results = await dbQuery(latestSql, [
    characterId,
    userId,
    BODY_TEMP_MIN,
    BODY_TEMP_MAX,
  ]);

  if (results.length === 0) {
    throw createError("측정값이 없습니다.", 404);
  }

  return { measurement: results[0] };
}

async function getMeasurementHistory({ userId, characterId }) {
  const historySql = `
    SELECT
      m.id,
      m.character_id,
      m.app_device_id,
      m.vital_type_id,
      vt.code AS vital_type,
      m.value,
      m.source_type,
      m.measured_at AS measurement_timestamp
    FROM measurements m
    INNER JOIN characters c ON m.character_id = c.id
    INNER JOIN vital_types vt ON m.vital_type_id = vt.id
    WHERE m.character_id = ? AND c.user_id = ?
    ORDER BY
      m.measured_at DESC,
      COALESCE(m.created_at, m.measured_at) DESC,
      m.id DESC
  `;

  const results = await dbQuery(historySql, [characterId, userId]);

  return { measurements: results };
}

async function getLatestVitals({ userId, characterId }) {
  const character = await findOwnedCharacter(characterId, userId);

  const latestSql = `
    SELECT
      m.id,
      m.character_id,
      m.app_device_id,
      m.vital_type_id,
      vt.code AS vital_type,
      m.value,
      m.measured_at,
      m.source_type
    FROM measurements m
    INNER JOIN vital_types vt ON m.vital_type_id = vt.id
    WHERE m.character_id = ?
      AND NOT (
        vt.code = 'TEMP'
        AND (m.source_type = 'device' OR m.value < ? OR m.value > ?)
      )
      AND NOT EXISTS (
        SELECT 1
        FROM measurements newer
        INNER JOIN vital_types newer_vt ON newer.vital_type_id = newer_vt.id
        WHERE newer.character_id = m.character_id
          AND newer.vital_type_id = m.vital_type_id
          AND NOT (
            newer_vt.code = 'TEMP'
            AND (newer.source_type = 'device' OR newer.value < ? OR newer.value > ?)
          )
          AND (
            newer.measured_at > m.measured_at
            OR (
              newer.measured_at = m.measured_at
              AND COALESCE(newer.created_at, newer.measured_at) >
                COALESCE(m.created_at, m.measured_at)
            )
            OR (
              newer.measured_at = m.measured_at
              AND COALESCE(newer.created_at, newer.measured_at) =
                COALESCE(m.created_at, m.measured_at)
              AND newer.id > m.id
            )
          )
      )
    ORDER BY
      m.measured_at DESC,
      COALESCE(m.created_at, m.measured_at) DESC,
      m.id DESC
  `;

  const rows = await dbQuery(latestSql, [
    character.id,
    BODY_TEMP_MIN,
    BODY_TEMP_MAX,
    BODY_TEMP_MIN,
    BODY_TEMP_MAX,
  ]);
  const vitals = {};

  SNAPSHOT_TYPES.forEach((type) => {
    vitals[type] = null;
  });

  rows.forEach((row) => {
    vitals[row.vital_type] = toMeasurementResponse(row);
  });

  const measuredTimes = rows
    .map((row) => new Date(row.measured_at).getTime())
    .filter((time) => !Number.isNaN(time));
  const measuredAt =
    measuredTimes.length > 0
      ? new Date(Math.max(...measuredTimes)).toISOString()
      : null;

  return {
    character: {
      id: character.id,
      name: character.name,
      age: character.age,
      gender: character.gender,
    },
    snapshot: {
      measuredAt,
      sourceSummary: {
        hasManualCorrection: rows.some((row) => row.source_type === "manual"),
        latestSourceType:
          rows.find((row) => toIso(row.measured_at) === measuredAt)?.source_type ||
          null,
      },
      vitals,
    },
    monitor: buildMonitor(vitals),
  };
}

async function getVitalHistory({ userId, characterId, filters = {} }) {
  const character = await findOwnedCharacter(characterId, userId);
  const conditions = ["m.character_id = ?"];
  const params = [character.id];

  const vitalType = filters.vitalType
    ? String(filters.vitalType).trim().toUpperCase()
    : null;
  const sourceType = filters.sourceType
    ? String(filters.sourceType).trim().toLowerCase()
    : null;

  if (vitalType) {
    conditions.push("vt.code = ?");
    params.push(vitalType);
  }

  if (sourceType) {
    conditions.push("m.source_type = ?");
    params.push(sourceType);
  }

  if (filters.from) {
    conditions.push("m.measured_at >= ?");
    params.push(new Date(filters.from));
  }

  if (filters.to) {
    conditions.push("m.measured_at <= ?");
    params.push(new Date(filters.to));
  }

  const limit = Math.min(parsePositiveInt(filters.limit, 100), 500);
  const offset = Math.max(parsePositiveInt(filters.offset, 0), 0);

  const historySql = `
    SELECT
      m.id,
      m.character_id,
      m.app_device_id,
      m.vital_type_id,
      vt.code AS vital_type,
      m.value,
      m.measured_at,
      m.source_type
    FROM measurements m
    INNER JOIN vital_types vt ON m.vital_type_id = vt.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY m.measured_at DESC, COALESCE(m.created_at, m.measured_at) DESC, m.id DESC
    LIMIT ? OFFSET ?
  `;

  const rows = await dbQuery(historySql, [...params, limit + 1, offset]);
  const pageRows = rows.slice(0, limit);

  return {
    characterId: character.id,
    filters: {
      vitalType,
      sourceType,
      from: filters.from || null,
      to: filters.to || null,
      limit,
      offset,
    },
    measurements: pageRows.map(toMeasurementResponse),
    pagination: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
  };
}

async function createManualCorrection({
  userId,
  characterId,
  vitalType,
  value,
  measuredAt,
  reason,
  sourceType = "manual",
  ipAddress,
}) {
  const character = await findOwnedCharacter(characterId, userId);
  const vitalTypeRow = await findVitalType(vitalType);
  const safeSourceType = sourceType === "simulation" ? "simulation" : "manual";

  if (vitalTypeRow.code === "TEMP" && !isValidBodyTemperature(value)) {
    await logSecurityEvent({
      userId,
      eventType: "MEASUREMENT_REJECTED",
      targetType: "character",
      targetId: character.id,
      description: `체온 범위를 벗어난 TEMP 수동 입력이 거부되었습니다. TEMP=${value}`,
      ipAddress,
    });

    throw createError("Invalid body temperature.", 400, {
      code: "INVALID_BODY_TEMPERATURE",
    });
  }

  const insertSql = `
    INSERT INTO measurements (
      character_id,
      app_device_id,
      vital_type_id,
      value,
      measured_at,
      source_type
    )
    VALUES (?, NULL, ?, ?, ?, ?)
  `;

  const result = await dbQuery(insertSql, [
    character.id,
    vitalTypeRow.id,
    value,
    measuredAt,
    safeSourceType,
  ]);

  await logSecurityEvent({
    userId,
    eventType:
      safeSourceType === "simulation"
        ? "SIMULATION_VITAL_UPDATED"
        : "MANUAL_VITAL_UPDATED",
    targetType: "measurement",
    targetId: result.insertId,
    description: `${safeSourceType} vital value saved. vital_type=${vitalTypeRow.code}, value=${value}, reason=${reason || ""}`,
    ipAddress,
  });

  const anomaly = detectMeasurementAnomaly(vitalTypeRow.code, value);
  if (anomaly) {
    await logSecurityEvent({
      userId,
      eventType: anomaly.type,
      targetType: "measurement",
      targetId: result.insertId,
      description: anomaly.description,
      ipAddress,
    });
  }

  return {
    message: "Manual correction saved.",
    measurement: {
      id: result.insertId,
      characterId: character.id,
      vitalType: vitalTypeRow.code,
      value,
      unit: getVitalUnit(vitalTypeRow.code),
      sourceType: safeSourceType,
      appDeviceId: null,
      measuredAt: toIso(measuredAt),
      createdAt: toIso(new Date()),
    },
  };
}

module.exports = {
  createMeasurement,
  getLatestMeasurement,
  getMeasurementHistory,
  getLatestVitals,
  getVitalHistory,
  createManualCorrection,
};
