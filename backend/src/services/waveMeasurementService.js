const dbQuery = require("../utils/dbQuery");
const createError = require("../utils/createError");

async function findOwnedMeasurement(measurementId, userId) {
  const sql = `
    SELECT m.id, m.character_id
    FROM measurements m
    INNER JOIN characters c ON m.character_id = c.id
    WHERE m.id = ? AND c.user_id = ?
  `;

  const results = await dbQuery(sql, [measurementId, userId]);

  if (results.length === 0) {
    throw createError("해당 measurement를 찾을 수 없습니다.", 404, {
      code: "MEASUREMENT_NOT_FOUND",
    });
  }

  return results[0];
}

async function findMeasurement(measurementId) {
  const sql = `
    SELECT id
    FROM measurements
    WHERE id = ?
  `;

  const results = await dbQuery(sql, [measurementId]);

  if (results.length === 0) {
    throw createError("해당 measurement를 찾을 수 없습니다.", 404, {
      code: "MEASUREMENT_NOT_FOUND",
    });
  }

  return results[0];
}

function parseWaveRow(wave) {
  return {
    ...wave,
    data: typeof wave.data === "string" ? JSON.parse(wave.data) : wave.data,
  };
}

async function createWaveMeasurement({
  measurementId,
  samplingRate,
  durationSeconds,
  data,
}) {
  // validator에서 이미 정제 완료
  await findMeasurement(measurementId);

  const insertWaveSql = `
    INSERT INTO wave_measurements (
      measurement_id,
      sampling_rate,
      duration_seconds,
      data,
      measured_at
    )
    VALUES (?, ?, ?, ?, NOW())
  `;

  const result = await dbQuery(insertWaveSql, [
    measurementId,
    samplingRate,
    durationSeconds,
    JSON.stringify(data),
  ]);

  return {
    message: "파형 저장에 성공했습니다.",
    waveMeasurementId: result.insertId,
  };
}

async function getWavesByMeasurement({ measurementId, userId }) {
  await findOwnedMeasurement(measurementId, userId);

  const getWavesSql = `
    SELECT id, measurement_id, sampling_rate, duration_seconds, data, measured_at
    FROM wave_measurements
    WHERE measurement_id = ?
    ORDER BY id DESC
  `;

  const results = await dbQuery(getWavesSql, [measurementId]);

  return {
    message: "파형 조회에 성공했습니다.",
    waves: results.map(parseWaveRow),
  };
}

async function getLatestWaveByMeasurement({ measurementId, userId }) {
  await findOwnedMeasurement(measurementId, userId);

  const getLatestWaveSql = `
    SELECT id, measurement_id, sampling_rate, duration_seconds, data, measured_at
    FROM wave_measurements
    WHERE measurement_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  const results = await dbQuery(getLatestWaveSql, [measurementId]);

  if (results.length === 0) {
    throw createError("파형 데이터가 없습니다.", 404, {
      code: "WAVE_DATA_NOT_FOUND",
    });
  }

  return {
    message: "최신 파형 조회에 성공했습니다.",
    wave: parseWaveRow(results[0]),
  };
}

module.exports = {
  createWaveMeasurement,
  getWavesByMeasurement,
  getLatestWaveByMeasurement,
};
