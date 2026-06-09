const VITAL_UNITS = {
  HR: "bpm",
  SPO2: "%",
  RR: "breaths/min",
  SBP: "mmHg",
  DBP: "mmHg",
  MAP: "mmHg",
  TEMP: "C",
};

function getVitalUnit(vitalType) {
  return VITAL_UNITS[vitalType] || "";
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function formatVitalValue(value, fallback = "000") {
  return value === null || value === undefined ? fallback : String(value);
}

function buildMonitor(vitals) {
  const sbp = vitals.SBP?.value;
  const dbp = vitals.DBP?.value;

  return {
    hr: formatVitalValue(vitals.HR?.value),
    spo2: formatVitalValue(vitals.SPO2?.value),
    rr: formatVitalValue(vitals.RR?.value),
    temp: formatVitalValue(vitals.TEMP?.value, "00.0"),
    bp:
      dbp === null || dbp === undefined || sbp === null || sbp === undefined
        ? "DBP/SBP"
        : `${sbp}/${dbp}`,
    map:
      vitals.MAP?.value === null || vitals.MAP?.value === undefined
        ? "(MAP)"
        : String(vitals.MAP.value),
  };
}

function toMeasurementResponse(row) {
  return {
    id: row.id,
    characterId: row.character_id,
    vitalType: row.vital_type,
    value: Number(row.value),
    unit: getVitalUnit(row.vital_type),
    sourceType: row.source_type || "device",
    appDeviceId: row.app_device_id,
    measuredAt: toIso(row.measured_at || row.measurement_timestamp),
    createdAt: toIso(row.created_at || row.measured_at || row.measurement_timestamp),
  };
}

module.exports = {
  buildMonitor,
  getVitalUnit,
  toIso,
  toMeasurementResponse,
};
