const DEFAULT_DERIVED_RR = 16;
const { resolveMeasurementRule } = require("./measurementRuleConfig");

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

function detectMeasurementAnomaly(vitalCode, value, profile = {}) {
  const rule = resolveMeasurementRule(vitalCode, profile);
  const numericValue = Number(value);

  if (!rule || !Number.isFinite(numericValue)) {
    return null;
  }

  if (rule.lowExclusive !== undefined && numericValue < rule.lowExclusive) {
    return { type: rule.lowType || rule.type, description: `${rule.label}=${value}` };
  }

  if (rule.highExclusive !== undefined && numericValue > rule.highExclusive) {
    return { type: rule.highType || rule.type, description: `${rule.label}=${value}` };
  }

  if (
    (rule.minInclusive !== undefined && numericValue <= rule.minInclusive) ||
    (rule.maxInclusive !== undefined && numericValue >= rule.maxInclusive)
  ) {
    return {
      type: rule.type,
      description: `Anomaly detected: ${rule.label}=${value}`,
    };
  }

  return null;
}

module.exports = {
  deriveRrFromSpo2,
  detectMeasurementAnomaly,
};
