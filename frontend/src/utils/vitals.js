import feverD from "../assets/images/feverD.png";
import feverU from "../assets/images/feverU.png";
import hyperD from "../assets/images/hyperD.png";
import hyperU from "../assets/images/hyperU.png";
import hypoD from "../assets/images/hypoD.png";
import hypoU from "../assets/images/hypoU.png";
import hypo2D from "../assets/images/hypo2D.png";
import hypo2U from "../assets/images/hypo2U.png";
import normalD from "../assets/images/normalD.png";
import normalU from "../assets/images/normalU.png";

export const WARNING_MESSAGE =
  "[WARNING] \uCE90\uB9AD\uD130\uAC00 \uC0DD\uC874\uD558\uAE30 \uC5B4\uB824\uC6B4 \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uC989\uC2DC \uC870\uCE58\uB97C \uCDE8\uD574 \uC8FC\uC138\uC694.";
export const HOMEOSTASIS_START_MESSAGE = "항상성 회복이 시작되었습니다.";
export const HOMEOSTASIS_COMPLETE_MESSAGE =
  "바이탈이 안정 상태로 회복되었습니다.";

const STORAGE_PREFIX = "vitacore.vitals.";
const EVENT_STORAGE_PREFIX = "vitacore.vitalEvents.";
const MAX_EVENT_LOGS = 20;
const VITAL_KEYS = ["HR", "SBP", "DBP", "RR", "SPO2", "TEMP"];

export const defaultVitalsByBmi = {
  BMI_UNDER: { HR: 82, SBP: 106, DBP: 68, RR: 17, SPO2: 98, TEMP: 36.5 },
  BMI_NORMAL: { HR: 75, SBP: 118, DBP: 76, RR: 16, SPO2: 98, TEMP: 36.7 },
  BMI_OVER: { HR: 84, SBP: 128, DBP: 82, RR: 18, SPO2: 97, TEMP: 36.8 },
};

/**
 * Apple Watch / HealthKit note:
 * HealthKit can provide processed health samples, but raw PPG peak data is not
 * directly available. Detecting PPG peaks would require SensorKit access, which
 * needs Apple approval.
 *
 * Therefore, VitaCore does not calculate real PTT from raw PPG - ECG.
 * Instead, it uses a virtual PTT model:
 *
 * virtualPTT = baselinePTT + stateVariation + personalCorrection
 *
 * Estimated BP can be derived from this virtual PTT model later. This is a
 * simulation-oriented approximation, not a medical calculation.
 */
export function estimateBpFromVirtualPtt(vitals) {
  return { SBP: vitals.SBP, DBP: vitals.DBP };
}

export const characterImages = {
  NORMAL: { U: normalU, D: normalD },
  HIGH_TEMP: { U: feverU, D: feverD },
  LOW_TEMP: { U: hypo2U, D: hypo2D },
  HIGH_BP: { U: hyperU, D: hyperD },
  LOW_BP: { U: hypoU, D: hypoD },
};

export const implementedCommands = [
  "APPLY_FLUID",
  "APPLY_BLEEDING",
  "APPLY_VASODILATION",
  "APPLY_VASOCONSTRICTION",
  "APPLY_OXYGEN",
  "APPLY_HYPOXIA",
  "APPLY_HYPERVENTILATION",
  "APPLY_HYPOVENTILATION",
  "APPLY_COLD",
  "APPLY_HEAT",
  "APPLY_ACTIVITY",
  "APPLY_REST",
  "APPLY_METABOLISM_UP",
  "APPLY_METABOLISM_DOWN",
  "APPLY_STRESS",
  "APPLY_RELAXATION",
];

export const commandEffects = {
  APPLY_FLUID: {
    BMI_UNDER: { HR: -8, SBP: +10, DBP: +5, RR: -1, SPO2: 0, TEMP: 0 },
    BMI_NORMAL: { HR: -6, SBP: +8, DBP: +4, RR: 0, SPO2: 0, TEMP: 0 },
    BMI_OVER: { HR: -4, SBP: +5, DBP: +3, RR: 0, SPO2: 0, TEMP: 0 },
  },
  APPLY_BLEEDING: {
    BMI_UNDER: { HR: +18, SBP: -18, DBP: -9, RR: +3, SPO2: -2, TEMP: -0.3 },
    BMI_NORMAL: { HR: +14, SBP: -14, DBP: -7, RR: +2, SPO2: -1, TEMP: -0.2 },
    BMI_OVER: { HR: +10, SBP: -10, DBP: -5, RR: +2, SPO2: -1, TEMP: -0.1 },
  },
  APPLY_VASODILATION: {
    BMI_UNDER: { HR: +10, SBP: -12, DBP: -8, RR: +1, SPO2: 0, TEMP: +0.1 },
    BMI_NORMAL: { HR: +8, SBP: -10, DBP: -6, RR: 0, SPO2: 0, TEMP: +0.1 },
    BMI_OVER: { HR: +6, SBP: -8, DBP: -5, RR: 0, SPO2: 0, TEMP: +0.1 },
  },
  APPLY_VASOCONSTRICTION: {
    BMI_UNDER: { HR: +4, SBP: +8, DBP: +5, RR: 0, SPO2: 0, TEMP: -0.1 },
    BMI_NORMAL: { HR: +5, SBP: +10, DBP: +6, RR: 0, SPO2: 0, TEMP: -0.1 },
    BMI_OVER: { HR: +8, SBP: +14, DBP: +9, RR: 1, SPO2: -1, TEMP: -0.1 },
  },
  APPLY_OXYGEN: {
    BMI_UNDER: { HR: -4, SBP: 0, DBP: 0, RR: -2, SPO2: +3, TEMP: 0 },
    BMI_NORMAL: { HR: -3, SBP: 0, DBP: 0, RR: -2, SPO2: +3, TEMP: 0 },
    BMI_OVER: { HR: -2, SBP: 0, DBP: 0, RR: -1, SPO2: +2, TEMP: 0 },
  },
  APPLY_HYPOXIA: {
    BMI_UNDER: { HR: +14, SBP: +6, DBP: +3, RR: +4, SPO2: -6, TEMP: 0 },
    BMI_NORMAL: { HR: +12, SBP: +5, DBP: +2, RR: +4, SPO2: -5, TEMP: 0 },
    BMI_OVER: { HR: +16, SBP: +8, DBP: +4, RR: +5, SPO2: -7, TEMP: 0 },
  },
  APPLY_HYPERVENTILATION: {
    BMI_UNDER: { HR: +8, SBP: +3, DBP: +2, RR: +8, SPO2: +1, TEMP: 0 },
    BMI_NORMAL: { HR: +7, SBP: +3, DBP: +2, RR: +7, SPO2: +1, TEMP: 0 },
    BMI_OVER: { HR: +10, SBP: +5, DBP: +3, RR: +8, SPO2: 0, TEMP: +0.1 },
  },
  APPLY_HYPOVENTILATION: {
    BMI_UNDER: { HR: +8, SBP: -2, DBP: -1, RR: -5, SPO2: -4, TEMP: 0 },
    BMI_NORMAL: { HR: +7, SBP: -2, DBP: -1, RR: -5, SPO2: -4, TEMP: 0 },
    BMI_OVER: { HR: +11, SBP: -3, DBP: -2, RR: -5, SPO2: -6, TEMP: 0 },
  },
  APPLY_COLD: {
    BMI_UNDER: { HR: -10, SBP: +4, DBP: +2, RR: -2, SPO2: -1, TEMP: -1.0 },
    BMI_NORMAL: { HR: -7, SBP: +3, DBP: +2, RR: -1, SPO2: 0, TEMP: -0.7 },
    BMI_OVER: { HR: -4, SBP: +2, DBP: +1, RR: -1, SPO2: 0, TEMP: -0.4 },
  },
  APPLY_HEAT: {
    BMI_UNDER: { HR: +8, SBP: -3, DBP: -2, RR: +2, SPO2: 0, TEMP: +0.5 },
    BMI_NORMAL: { HR: +10, SBP: -4, DBP: -2, RR: +2, SPO2: 0, TEMP: +0.7 },
    BMI_OVER: { HR: +14, SBP: -5, DBP: -3, RR: +3, SPO2: -1, TEMP: +1.0 },
  },
  APPLY_ACTIVITY: {
    BMI_UNDER: { HR: +16, SBP: +8, DBP: +3, RR: +5, SPO2: -1, TEMP: +0.3 },
    BMI_NORMAL: { HR: +14, SBP: +10, DBP: +4, RR: +4, SPO2: 0, TEMP: +0.3 },
    BMI_OVER: { HR: +20, SBP: +14, DBP: +6, RR: +6, SPO2: -2, TEMP: +0.4 },
  },
  APPLY_REST: {
    BMI_UNDER: { HR: -8, SBP: -4, DBP: -2, RR: -2, SPO2: +1, TEMP: 0 },
    BMI_NORMAL: { HR: -7, SBP: -5, DBP: -2, RR: -2, SPO2: +1, TEMP: 0 },
    BMI_OVER: { HR: -5, SBP: -4, DBP: -2, RR: -1, SPO2: +1, TEMP: 0 },
  },
  APPLY_METABOLISM_UP: {
    BMI_UNDER: { HR: +12, SBP: +5, DBP: +2, RR: +3, SPO2: 0, TEMP: +0.4 },
    BMI_NORMAL: { HR: +10, SBP: +5, DBP: +2, RR: +3, SPO2: 0, TEMP: +0.4 },
    BMI_OVER: { HR: +14, SBP: +7, DBP: +3, RR: +4, SPO2: -1, TEMP: +0.5 },
  },
  APPLY_METABOLISM_DOWN: {
    BMI_UNDER: { HR: -9, SBP: -5, DBP: -2, RR: -2, SPO2: 0, TEMP: -0.3 },
    BMI_NORMAL: { HR: -7, SBP: -4, DBP: -2, RR: -2, SPO2: 0, TEMP: -0.2 },
    BMI_OVER: { HR: -5, SBP: -3, DBP: -1, RR: -1, SPO2: 0, TEMP: -0.2 },
  },
  APPLY_STRESS: {
    BMI_UNDER: { HR: +12, SBP: +8, DBP: +4, RR: +3, SPO2: 0, TEMP: +0.1 },
    BMI_NORMAL: { HR: +14, SBP: +10, DBP: +5, RR: +3, SPO2: 0, TEMP: +0.1 },
    BMI_OVER: { HR: +18, SBP: +15, DBP: +8, RR: +4, SPO2: -1, TEMP: +0.2 },
  },
  APPLY_RELAXATION: {
    BMI_UNDER: { HR: -8, SBP: -5, DBP: -3, RR: -2, SPO2: +1, TEMP: 0 },
    BMI_NORMAL: { HR: -9, SBP: -6, DBP: -3, RR: -2, SPO2: +1, TEMP: 0 },
    BMI_OVER: { HR: -7, SBP: -5, DBP: -2, RR: -2, SPO2: +1, TEMP: 0 },
  },
};

export function calculateBmi(height, weight) {
  const numericHeight = Number(height);
  const numericWeight = Number(weight);
  if (!numericHeight || !numericWeight) return null;
  return numericWeight / (numericHeight / 100) ** 2;
}

export function getBmiClass(bmi) {
  if (bmi < 18.5) return "BMI_UNDER";
  if (bmi < 25) return "BMI_NORMAL";
  return "BMI_OVER";
}

export function getDefaultVitalsByBmi(bmi) {
  return { ...defaultVitalsByBmi[getBmiClass(bmi || 22)] };
}

export function estimateRrFromSpo2(vitals) {
  let rr = Number(vitals.RR);

  if (!Number.isFinite(rr)) {
    return vitals.RR;
  }

  if (Number(vitals.SPO2) < 90) {
    rr += 6;
  } else if (Number(vitals.SPO2) < 95) {
    rr += 3;
  }

  return rr;
}

export function normalizeVitals(vitals, fallback = null, shouldClamp = false) {
  if (!vitals) return fallback ? { ...fallback } : null;

  const normalized = {};
  VITAL_KEYS.forEach((key) => {
    const value = Number(vitals[key]);
    normalized[key] = Number.isFinite(value) ? value : fallback?.[key];
  });

  if (VITAL_KEYS.some((key) => normalized[key] === undefined)) {
    return fallback ? { ...fallback } : null;
  }

  return shouldClamp ? clampVitals(normalized) : normalized;
}

export function resolveCurrentVitals({
  manualVitals,
  storedVitals,
  measuredVitals,
  bmi,
} = {}) {
  return (
    normalizeVitals(manualVitals, null) ||
    normalizeVitals(storedVitals, null) ||
    normalizeVitals(measuredVitals, null, true) ||
    getDefaultVitalsByBmi(bmi)
  );
}

export function clampVitals(vitals) {
  const safeVitals = {
    HR: Number(vitals.HR),
    SBP: Number(vitals.SBP),
    DBP: Number(vitals.DBP),
    RR: Number(vitals.RR),
    SPO2: Number(vitals.SPO2),
    TEMP: Number(vitals.TEMP),
  };

  return {
    HR: Math.max(0, Math.min(220, Math.round(safeVitals.HR))),
    SBP: Math.max(40, Math.min(240, Math.round(safeVitals.SBP))),
    DBP: Math.max(20, Math.min(160, Math.round(safeVitals.DBP))),
    RR: Math.max(0, Math.min(60, Math.round(safeVitals.RR))),
    SPO2: Math.max(0, Math.min(100, Math.round(safeVitals.SPO2))),
    TEMP: Math.max(34, Math.min(42, Number(safeVitals.TEMP.toFixed(1)))),
  };
}

export function applyCommand(currentVitals, commandName, bmi, level = 1) {
  const bmiClass = getBmiClass(bmi);
  const effect = commandEffects[commandName]?.[bmiClass];
  const safeLevel = Math.max(1, Math.min(3, Number(level) || 1));

  if (!effect) {
    return currentVitals;
  }

  const nextVitals = {
    HR: currentVitals.HR + effect.HR * safeLevel,
    SBP: currentVitals.SBP + effect.SBP * safeLevel,
    DBP: currentVitals.DBP + effect.DBP * safeLevel,
    RR: currentVitals.RR + effect.RR * safeLevel,
    SPO2: currentVitals.SPO2 + effect.SPO2 * safeLevel,
    TEMP: Number((currentVitals.TEMP + effect.TEMP * safeLevel).toFixed(1)),
  };

  nextVitals.RR = estimateRrFromSpo2(nextVitals);

  return clampVitals(nextVitals);
}

export function moveToward(current, target, step) {
  if (current === target) return current;

  if (current < target) {
    return Math.min(current + step, target);
  }

  return Math.max(current - step, target);
}

export function applyHomeostasis(currentVitals, targetVitals) {
  return {
    HR: Math.round(moveToward(Number(currentVitals.HR), Number(targetVitals.HR), 1)),
    SBP: Math.round(
      moveToward(Number(currentVitals.SBP), Number(targetVitals.SBP), 1)
    ),
    DBP: Math.round(
      moveToward(Number(currentVitals.DBP), Number(targetVitals.DBP), 1)
    ),
    RR: Math.round(moveToward(Number(currentVitals.RR), Number(targetVitals.RR), 1)),
    SPO2: Math.round(
      moveToward(Number(currentVitals.SPO2), Number(targetVitals.SPO2), 1)
    ),
    TEMP: Number(
      moveToward(Number(currentVitals.TEMP), Number(targetVitals.TEMP), 0.1).toFixed(1)
    ),
  };
}

export function areVitalsEqual(leftVitals, rightVitals) {
  return VITAL_KEYS.every(
    (key) => Number(leftVitals?.[key]) === Number(rightVitals?.[key])
  );
}

export function isCriticalState(vitals) {
  return (
    vitals.TEMP >= 41 ||
    vitals.TEMP <= 32 ||
    vitals.SBP <= 70 ||
    vitals.SPO2 <= 85 ||
    vitals.HR >= 180 ||
    vitals.HR <= 35 ||
    vitals.RR >= 40 ||
    vitals.RR <= 6
  );
}

export function getCharacterState(vitals) {
  if (vitals.TEMP >= 38) return "HIGH_TEMP";
  if (vitals.TEMP <= 35) return "LOW_TEMP";
  if (vitals.SBP >= 140 || vitals.DBP >= 90) return "HIGH_BP";
  if (vitals.SBP <= 90 || vitals.DBP <= 60) return "LOW_BP";
  return "NORMAL";
}

export function getCharacterImage(vitals, direction = "U") {
  const state = getCharacterState(vitals);
  const safeDirection = direction === "D" ? "D" : "U";
  return characterImages[state][safeDirection];
}

export function toDisplayVitals(vitals) {
  const map = Math.round((vitals.SBP + 2 * vitals.DBP) / 3);
  return {
    hr: String(vitals.HR),
    spo2: String(vitals.SPO2),
    rr: String(vitals.RR),
    temp: Number(vitals.TEMP).toFixed(1),
    bp: `${vitals.SBP}/${vitals.DBP}`,
    map: `(${map})`,
  };
}

export function parseDisplayVitals(display, fallback = getDefaultVitalsByBmi()) {
  const [sbp, dbp] = String(display?.bp || "").split("/").map(Number);
  const vitals = {
    HR: Number(display?.hr),
    SBP: sbp,
    DBP: dbp,
    RR: Number(display?.rr),
    SPO2: Number(display?.spo2),
    TEMP: Number(display?.temp),
  };

  return clampVitals({
    HR: Number.isFinite(vitals.HR) ? vitals.HR : fallback.HR,
    SBP: Number.isFinite(vitals.SBP) ? vitals.SBP : fallback.SBP,
    DBP: Number.isFinite(vitals.DBP) ? vitals.DBP : fallback.DBP,
    RR: Number.isFinite(vitals.RR) ? vitals.RR : fallback.RR,
    SPO2: Number.isFinite(vitals.SPO2) ? vitals.SPO2 : fallback.SPO2,
    TEMP:
      Number.isFinite(vitals.TEMP) && vitals.TEMP >= 34 && vitals.TEMP <= 42
        ? vitals.TEMP
        : fallback.TEMP,
  });
}

export function getStoredVitals(characterId) {
  if (!characterId) return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${characterId}`);
    return raw ? normalizeVitals(JSON.parse(raw), null) : null;
  } catch {
    return null;
  }
}

export function setStoredVitals(characterId, vitals) {
  if (!characterId) return;
  localStorage.setItem(`${STORAGE_PREFIX}${characterId}`, JSON.stringify(vitals));
}

export function clearStoredVitals(characterId) {
  if (!characterId) return;
  localStorage.removeItem(`${STORAGE_PREFIX}${characterId}`);
}

export function createVitalEvent(message, type = "info") {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    type,
  };
}

export function getStoredVitalEvents(characterId) {
  if (!characterId) return [];

  try {
    const raw = localStorage.getItem(`${EVENT_STORAGE_PREFIX}${characterId}`);
    const events = raw ? JSON.parse(raw) : [];
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function setStoredVitalEvents(characterId, events) {
  if (!characterId) return;
  localStorage.setItem(
    `${EVENT_STORAGE_PREFIX}${characterId}`,
    JSON.stringify(events.slice(0, MAX_EVENT_LOGS))
  );
}

export function appendStoredVitalEvent(characterId, event) {
  if (!characterId) return [];
  const nextEvents = [event, ...getStoredVitalEvents(characterId)].slice(
    0,
    MAX_EVENT_LOGS
  );
  setStoredVitalEvents(characterId, nextEvents);
  return nextEvents;
}

export function clearStoredVitalEvents(characterId) {
  if (!characterId) return;
  localStorage.removeItem(`${EVENT_STORAGE_PREFIX}${characterId}`);
}

