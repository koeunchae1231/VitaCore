const DEFAULT_DERIVED_RR = 16;

function deriveRrFromSpo2(spo2, baseRr = DEFAULT_DERIVED_RR) {
  const numericSpo2 = Number(spo2);
  const numericBase = Number(baseRr);
  const safeBase = Number.isFinite(numericBase) ? numericBase : DEFAULT_DERIVED_RR;
  let adjustment = 0;

  if (numericSpo2 < 90) {
    adjustment = 6;
  } else if (numericSpo2 < 95) {
    adjustment = 3;
  }

  return Math.max(6, Math.min(40, Math.round(safeBase + adjustment)));
}

function detectMeasurementAnomaly(vitalCode, value) {
  switch (vitalCode) {
    case "HR":
      if (value <= 35 || value >= 180) {
        return { type: "ANOMALY_DETECTED", description: `위험 HR 감지: HR=${value}` };
      }
      return null;

    case "SPO2":
      if (value <= 85) {
        return { type: "ANOMALY_DETECTED", description: `위험 SpO2 감지: SpO2=${value}` };
      }
      return null;

    case "RR":
      if (value <= 6 || value >= 40) {
        return { type: "ANOMALY_DETECTED", description: `위험 RR 감지: RR=${value}` };
      }
      return null;

    case "SBP":
      if (value <= 70 || value >= 200) {
        return { type: "ANOMALY_DETECTED", description: `위험 SBP 감지: SBP=${value}` };
      }
      return null;

    case "DBP":
      if (value <= 40 || value >= 130) {
        return { type: "ANOMALY_DETECTED", description: `위험 DBP 감지: DBP=${value}` };
      }
      return null;

    case "MAP":
      if (value < 50) return { type: "ANOMALY_LOW_MAP", description: `MAP=${value}` };
      if (value > 160) return { type: "ANOMALY_HIGH_MAP", description: `MAP=${value}` };
      return null;

    case "TEMP":
      if (value <= 32 || value >= 41) {
        return { type: "ANOMALY_DETECTED", description: `위험 TEMP 감지: TEMP=${value}` };
      }
      return null;

    default:
      return null;
  }
}

module.exports = {
  deriveRrFromSpo2,
  detectMeasurementAnomaly,
};
