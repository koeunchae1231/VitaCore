const measurementRuleConfig = {
  HR: {
    minInclusive: 35,
    maxInclusive: 180,
    type: "ANOMALY_DETECTED",
    label: "HR",
  },
  SPO2: {
    minInclusive: 85,
    type: "ANOMALY_DETECTED",
    label: "SpO2",
  },
  RR: {
    minInclusive: 6,
    maxInclusive: 40,
    type: "ANOMALY_DETECTED",
    label: "RR",
  },
  SBP: {
    minInclusive: 70,
    maxInclusive: 200,
    type: "ANOMALY_DETECTED",
    label: "SBP",
  },
  DBP: {
    minInclusive: 40,
    maxInclusive: 130,
    type: "ANOMALY_DETECTED",
    label: "DBP",
  },
  MAP: {
    lowExclusive: 50,
    highExclusive: 160,
    lowType: "ANOMALY_LOW_MAP",
    highType: "ANOMALY_HIGH_MAP",
    label: "MAP",
  },
  TEMP: {
    minInclusive: 32,
    maxInclusive: 41,
    type: "ANOMALY_DETECTED",
    label: "TEMP",
  },
};

function resolveMeasurementRule(vitalCode, _profile = {}) {
  return measurementRuleConfig[vitalCode] || null;
}

module.exports = {
  measurementRuleConfig,
  resolveMeasurementRule,
};
