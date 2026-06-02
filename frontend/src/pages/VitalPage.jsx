import { useEffect, useMemo, useRef, useState } from "react";

import { fetchCharacter } from "../api/characterApi";
import {
  createManualCorrection,
  fetchLatestVitals,
  fetchVitalHistory,
} from "../api/measurementApi";
import { logClientSecurityEvent } from "../api/securityEventApi";
import { useApp } from "../App";
import MonitorFrame from "../components/MonitorFrame";
import VitalMonitor from "../components/VitalMonitor";
import { routes } from "../router";
import {
  WARNING_MESSAGE,
  appendStoredVitalEvent,
  applyHomeostasis,
  areVitalsEqual,
  calculateBmi,
  createVitalEvent,
  estimateRrFromSpo2,
  HOMEOSTASIS_COMPLETE_MESSAGE,
  HOMEOSTASIS_START_MESSAGE,
  getDefaultVitalsByBmi,
  getStoredVitals,
  isCriticalState,
  parseDisplayVitals,
  resolveCurrentVitals,
  setStoredVitals,
  toDisplayVitals,
} from "../utils/vitals";

function formatGender(gender) {
  if (!gender) return "MF";
  return gender.slice(0, 1).toUpperCase();
}

const manualLabels = {
  HR: "HR",
  TEMP: "TEMP",
  SPO2: "SpO2",
  RR: "RR",
  BP: "BP",
};

function getManualSaveEntries(field, values) {
  if (field === "BP") {
    return [
      ["SBP", values.SBP],
      ["DBP", values.DBP],
    ];
  }

  if (field === "SPO2") {
    return [
      ["SPO2", values.SPO2],
      ["RR", values.RR],
    ];
  }

  return [[field, values[field]]];
}

const SNAPSHOT_SAVE_KEYS = ["HR", "SPO2", "RR", "SBP", "DBP", "TEMP"];
const DEFAULT_EVENT_MESSAGE = "BMI 기준 기본 바이탈 값이 적용되어 있습니다.";
const DEVICE_EVENT_MESSAGE = "실측 정보가 반영되었습니다.";
const LATEST_EVENT_MESSAGE = "최근 측정값이 반영되었습니다.";
const STORED_EVENT_MESSAGE = "저장된 현재 바이탈 값이 적용되어 있습니다.";
const DEFAULT_APPLIED_MESSAGE = "BMI 기준 기본 바이탈 값으로 초기화되었습니다.";
const LOADING_MESSAGE = "바이탈 값을 불러오는 중입니다.";
const HISTORY_LIMIT = 8;

function isUnsafeDisplayMessage(message) {
  return /<!doctype|<html|Cannot GET|characterId=|vitalCode=|source_type=|measured_at|created_at/i.test(
    String(message || "")
  );
}

function getSafeErrorMessage(err, fallback = "요청 처리 중 오류가 발생했습니다.") {
  const message = String(err?.message || "");
  return isUnsafeDisplayMessage(message) ? fallback : message;
}

async function saveVitalSnapshot({
  characterId,
  values,
  measuredAt,
  reason,
  sourceType,
}) {
  await Promise.all(
    SNAPSHOT_SAVE_KEYS.map((vitalType) =>
      createManualCorrection({
        characterId,
        vitalType,
        value: values[vitalType],
        measuredAt,
        reason,
        sourceType,
      })
    )
  );
}

function fetchVitalDashboardData(characterId) {
  return [
    fetchLatestVitals(characterId),
    fetchVitalHistory(characterId, { limit: HISTORY_LIMIT }),
  ];
}

export default function VitalPage() {
  const { logout, navigate, selectedCharacterId } = useApp();
  const [vitals, setVitals] = useState(null);
  const [character, setCharacter] = useState(null);
  const [history, setHistory] = useState([]);
  const [latestSourceType, setLatestSourceType] = useState(null);
  const [eventLog, setEventLog] = useState(DEFAULT_EVENT_MESSAGE);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const homeostasisActiveRef = useRef(false);
  const latestMeasurementAtRef = useRef(null);

  const bmi = useMemo(
    () => calculateBmi(character?.height, character?.weight) || 22,
    [character]
  );
  const currentVitals = vitals || getDefaultVitalsByBmi(bmi);
  const displayVitals = toDisplayVitals(currentVitals);

  function addVitalEvent(message, type = "info") {
    appendStoredVitalEvent(selectedCharacterId, createVitalEvent(message, type));
  }

  function applyMeasuredVitals(latestData, nextBmi) {
    const measuredAt = latestData?.snapshot?.measuredAt || null;
    const sourceType = latestData?.snapshot?.sourceSummary?.latestSourceType || null;
    const nextVitals = resolveCurrentVitals({
      measuredVitals: parseDisplayVitals(
        latestData.monitor,
        getDefaultVitalsByBmi(nextBmi)
      ),
      bmi: nextBmi,
    });

    setVitals(nextVitals);
    setStoredVitals(selectedCharacterId, nextVitals);
    setLatestSourceType(sourceType);
    latestMeasurementAtRef.current = measuredAt;
    homeostasisActiveRef.current = false;
    setEventLog(sourceType === "device" ? DEVICE_EVENT_MESSAGE : LATEST_EVENT_MESSAGE);
  }

  async function handleDefaultVitals() {
    if (!selectedCharacterId) return;

    const nextVitals = getDefaultVitalsByBmi(bmi);
    const message = DEFAULT_APPLIED_MESSAGE;

    setVitals(nextVitals);
    setStoredVitals(selectedCharacterId, nextVitals);
    homeostasisActiveRef.current = false;
    setLatestSourceType("simulation");
    setEventLog(message);
    addVitalEvent(message);

    try {
      await saveVitalSnapshot({
        characterId: selectedCharacterId,
        values: nextVitals,
        measuredAt: new Date().toISOString(),
        reason: "vital page DEFAULT",
        sourceType: "simulation",
      });
      await loadLatestVitals();
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(getSafeErrorMessage(err));
    }
  }

  function parseManualVital(field, value) {
    if (field === "BP") {
      const [sbp, dbp] = String(value)
        .split("/")
        .map((part) => Number(part.trim()));

      if (!Number.isFinite(sbp) || !Number.isFinite(dbp)) {
        return { error: "BP는 120/80 형식으로 입력해 주세요." };
      }

      return {
        values: { SBP: sbp, DBP: dbp },
        displayValue: `${sbp}/${dbp}`,
      };
    }

    const numberValue = Number(String(value).trim());
    if (!Number.isFinite(numberValue)) {
      return { error: "숫자로 변환할 수 없는 값입니다." };
    }

    if (field === "TEMP" && (numberValue < 34 || numberValue > 42)) {
      return { error: "TEMP는 34.0~42.0 범위의 체온 값만 입력할 수 있습니다." };
    }

    return {
      values: {
        [field]: field === "TEMP" ? Number(numberValue.toFixed(1)) : numberValue,
      },
      displayValue: field === "TEMP" ? numberValue.toFixed(1) : String(numberValue),
    };
  }

  async function handleManualChange(field, value) {
    const parsed = parseManualVital(field, value);

    if (parsed.error) {
      setEventLog(parsed.error);
      addVitalEvent(parsed.error);
      return;
    }

    const nextVitals = {
      ...currentVitals,
      ...parsed.values,
    };

    if (field === "SPO2") {
      nextVitals.RR = estimateRrFromSpo2(nextVitals);
    }

    setVitals(nextVitals);
    setStoredVitals(selectedCharacterId, nextVitals);
    homeostasisActiveRef.current = false;
    setLatestSourceType("manual");

    const eventMessage = `${manualLabels[field]} 수동 입력값이 ${parsed.displayValue}(으)로 변경되었습니다.`;
    setEventLog(eventMessage);
    addVitalEvent(eventMessage);
    logClientSecurityEvent({
      eventType: "MANUAL_VITAL_UPDATED",
      targetType: "character",
      targetId: selectedCharacterId,
      description: eventMessage,
    }).catch(() => {});

    if (isCriticalState(nextVitals)) {
      addVitalEvent(WARNING_MESSAGE, "warning");
      logClientSecurityEvent({
        eventType: "ANOMALY_DETECTED",
        targetType: "character",
        targetId: selectedCharacterId,
        description: WARNING_MESSAGE,
      }).catch(() => {});
    }

    try {
      const measuredAt = new Date().toISOString();
      await Promise.all(
        getManualSaveEntries(field, nextVitals).map(([vitalType, vitalValue]) =>
          createManualCorrection({
            characterId: selectedCharacterId,
            vitalType,
            value: vitalValue,
            measuredAt,
            reason: `vital page ${manualLabels[field]} manual edit`,
          })
        )
      );
      await loadLatestVitals();
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(getSafeErrorMessage(err));
    }
  }

  async function loadLatestVitals() {
    if (!selectedCharacterId) {
      setError("먼저 캐릭터를 선택해 주세요.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const characterData = await fetchCharacter(selectedCharacterId);
      const nextCharacter = characterData.character;
      const nextBmi =
        calculateBmi(nextCharacter?.height, nextCharacter?.weight) || 22;
      setCharacter(nextCharacter);

      const [latestData, historyData] = await Promise.allSettled(
        fetchVitalDashboardData(selectedCharacterId)
      );

      const storedVitals = getStoredVitals(selectedCharacterId);
      if (latestData.status === "fulfilled") {
        applyMeasuredVitals(latestData.value, nextBmi);
      } else if (storedVitals) {
        setVitals(resolveCurrentVitals({ storedVitals, bmi: nextBmi }));
        setLatestSourceType("simulation");
        setEventLog(STORED_EVENT_MESSAGE);
      } else {
        setVitals(resolveCurrentVitals({ bmi: nextBmi }));
        setLatestSourceType("simulation");
        setEventLog(DEFAULT_EVENT_MESSAGE);
      }

      if (historyData.status === "fulfilled") {
        setHistory(historyData.value.measurements || []);
      }

      if (latestData.status === "rejected" && latestData.reason?.status !== 404) {
        setError(getSafeErrorMessage(latestData.reason));
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(getSafeErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLatestVitals();
  }, [selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId || !character) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const [latestData, historyData] = await Promise.all(
          fetchVitalDashboardData(selectedCharacterId)
        );
        const measuredAt = latestData?.snapshot?.measuredAt || null;
        const sourceType =
          latestData?.snapshot?.sourceSummary?.latestSourceType || null;

        if (sourceType && measuredAt !== latestMeasurementAtRef.current) {
          applyMeasuredVitals(latestData, bmi);
        }

        setHistory(historyData.measurements || []);
      } catch (err) {
        if (err.status === 401) logout();
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [bmi, character, logout, selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId || !character) return undefined;
    if (latestSourceType) return undefined;

    const timer = window.setInterval(() => {
      const targetVitals = getDefaultVitalsByBmi(bmi);

      setVitals((current) => {
        const currentVitals =
          current || getStoredVitals(selectedCharacterId) || targetVitals;

        if (areVitalsEqual(currentVitals, targetVitals)) {
          if (homeostasisActiveRef.current) {
            homeostasisActiveRef.current = false;
            setEventLog(HOMEOSTASIS_COMPLETE_MESSAGE);
            addVitalEvent(HOMEOSTASIS_COMPLETE_MESSAGE);
          }
          return currentVitals;
        }

        if (!homeostasisActiveRef.current) {
          homeostasisActiveRef.current = true;
          setEventLog(HOMEOSTASIS_START_MESSAGE);
          addVitalEvent(HOMEOSTASIS_START_MESSAGE);
        }

        const nextVitals = applyHomeostasis(currentVitals, targetVitals);
        setStoredVitals(selectedCharacterId, nextVitals);
        return nextVitals;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [bmi, character, latestSourceType, selectedCharacterId]);

  return (
    <MonitorFrame
      title="VITACORE VITALS"
      patientName={character?.name || "NAME"}
      patientSex={formatGender(character?.gender)}
      patientAge={character?.age || "00"}
      alarm={error || (isLoading ? LOADING_MESSAGE : eventLog)}
      actions={[
        { label: "BACK", onClick: () => navigate(routes.characters) },
        { label: "CHARACTER", onClick: () => navigate(routes.characterReport) },
        { label: "DEFAULT", onClick: handleDefaultVitals },
        { label: "CONNECTION", onClick: () => navigate(routes.connection) },
      ]}
    >
      <VitalMonitor
        vitals={displayVitals}
        rawVitals={currentVitals}
        onManualChange={handleManualChange}
      />

      <section className="vital-history-panel" aria-label="Recent history">
        {history.length > 0 && (
          <p className="vital-history-row">
            HISTORY READY / {history.length} RECENT MEASUREMENTS
            {latestSourceType === "device" ? " / 실측 정보" : ""}
          </p>
        )}
      </section>
    </MonitorFrame>
  );
}
