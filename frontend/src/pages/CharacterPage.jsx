import { useEffect, useMemo, useState } from "react";

import { fetchCharacter } from "../api/characterApi";
import { createManualCorrection, fetchLatestVitals } from "../api/measurementApi";
import {
  fetchCharacterSecurityEvents,
  logClientSecurityEvent,
} from "../api/securityEventApi";
import { useApp } from "../App";
import CharacterViewer from "../components/CharacterViewer";
import MonitorFrame from "../components/MonitorFrame";
import { routes } from "../router";
import {
  WARNING_MESSAGE,
  appendStoredVitalEvent,
  applyCommand,
  calculateBmi,
  clearStoredVitalEvents,
  clearStoredVitals,
  createVitalEvent,
  getDefaultVitalsByBmi,
  getStoredVitalEvents,
  getStoredVitals,
  implementedCommands,
  isCriticalState,
  parseDisplayVitals,
  resolveCurrentVitals,
  setStoredVitalEvents,
  setStoredVitals,
  toDisplayVitals,
} from "../utils/vitals";

function formatGender(gender) {
  if (!gender) return "MF";
  return gender.slice(0, 1).toUpperCase();
}

function toCharacterReport(character) {
  if (!character) {
    return {
      name: "NAME",
      height: "--",
      weight: "--",
      bmi: "--",
    };
  }

  const bmi = calculateBmi(character.height, character.weight);

  return {
    name: character.name,
    height: `${character.height}cm`,
    weight: `${character.weight}kg`,
    bmi: bmi ? bmi.toFixed(1) : "--",
  };
}

const commandMessages = {
  APPLY_FLUID: "수액 투여가 적용되었습니다.",
  APPLY_BLEEDING: "출혈 상태가 적용되었습니다.",
  APPLY_VASODILATION: "혈관 확장이 적용되었습니다.",
  APPLY_VASOCONSTRICTION: "혈관 수축이 적용되었습니다.",
  APPLY_OXYGEN: "산소 공급이 적용되었습니다.",
  APPLY_HYPOXIA: "산소 부족 상태가 적용되었습니다.",
  APPLY_HYPERVENTILATION: "과호흡 상태가 적용되었습니다.",
  APPLY_HYPOVENTILATION: "저호흡 상태가 적용되었습니다.",
  APPLY_COLD: "저체온 상태가 적용되었습니다.",
  APPLY_HEAT: "고체온 상태가 적용되었습니다.",
  APPLY_ACTIVITY: "활동 증가가 적용되었습니다.",
  APPLY_REST: "휴식 상태가 적용되었습니다.",
  APPLY_METABOLISM_UP: "대사 증가가 적용되었습니다.",
  APPLY_METABOLISM_DOWN: "대사 감소가 적용되었습니다.",
  APPLY_STRESS: "스트레스 상태가 적용되었습니다.",
  APPLY_RELAXATION: "이완 상태가 적용되었습니다.",
};

const VITAL_SAVE_KEYS = ["HR", "SBP", "DBP", "RR", "SPO2", "TEMP"];

const EVENT_DISPLAY_MESSAGES = {
  DEVICE_MEASUREMENT_RECEIVED: "실측 바이탈 정보가 반영되었습니다.",
  DEVICE_VITAL_UPDATED: "실측 바이탈 정보가 반영되었습니다.",
  DERIVED_VITAL_UPDATED: "산소포화도 기반으로 호흡수가 갱신되었습니다.",
  SIMULATION_VITAL_UPDATED: "시뮬레이션 값이 적용되었습니다.",
  COMMAND_APPLIED: "시뮬레이션 값이 적용되었습니다.",
  MANUAL_VITAL_UPDATED: "바이탈 정보가 수정되었습니다.",
  MEASUREMENT_REJECTED: "비정상 체온 값이 감지되어 반영하지 않았습니다.",
  ANOMALY_DETECTED: WARNING_MESSAGE,
  ANOMALY_LOW_MAP: WARNING_MESSAGE,
  ANOMALY_HIGH_MAP: WARNING_MESSAGE,
};

const EVENT_FETCH_ERROR_MESSAGE = "이벤트 로그를 불러오지 못했습니다.";

function isUnsafeEventMessage(message) {
  const value = String(message || "");
  return (
    !value ||
    /<!doctype|<html|Cannot GET|characterId=|vitalCode=|source_type=|measured_at=|created_at=/i.test(
      value
    )
  );
}

function getSafeErrorMessage(err, fallback = "요청 처리 중 오류가 발생했습니다.") {
  const message = String(err?.message || "");
  return isUnsafeEventMessage(message) ? fallback : message;
}

function getEventMessage(event) {
  const explicitMessage =
    event.display_message ||
    event.displayMessage ||
    event.user_message ||
    event.userMessage;

  if (!isUnsafeEventMessage(explicitMessage)) {
    return explicitMessage;
  }

  if (event.type === "MEASUREMENT_IGNORED") {
    return String(event.description || "").includes("RR")
      ? "호흡수 실측값은 정책에 따라 반영하지 않았습니다."
      : "비정상 체온 값이 감지되어 반영하지 않았습니다.";
  }

  return EVENT_DISPLAY_MESSAGES[event.type] || "이벤트가 기록되었습니다.";
}

function compactDisplayEvents(events) {
  return events.reduce((acc, event) => {
    const currentTime = event.createdAt ? new Date(event.createdAt).getTime() : null;
    const isDuplicate = acc.some((previous) => {
      const previousTime = previous?.createdAt
        ? new Date(previous.createdAt).getTime()
        : null;

      return (
        previous?.message === event.message &&
        previous?.type === event.type &&
        (!currentTime ||
          !previousTime ||
          Math.abs(previousTime - currentTime) <= 10000)
      );
    });

    if (!isDuplicate) {
      acc.push(event);
    }

    return acc;
  }, []);
}

function toDisplayEvent(event) {
  return {
    id: event.id,
    message: getEventMessage(event),
    type:
      event.type === "ANOMALY_DETECTED" ||
      event.type === "ANOMALY_LOW_MAP" ||
      event.type === "ANOMALY_HIGH_MAP" ||
      event.type === "MEASUREMENT_IGNORED" ||
      event.type === "MEASUREMENT_REJECTED"
        ? "warning"
        : "info",
    createdAt: event.createdAt,
  };
}

async function saveManualVitals(characterId, nextVitals, reason, sourceType = "manual") {
  const measuredAt = new Date().toISOString();

  await Promise.all(
    VITAL_SAVE_KEYS.map((vitalType) =>
      createManualCorrection({
        characterId,
        vitalType,
        value: nextVitals[vitalType],
        measuredAt,
        reason,
        sourceType,
      })
    )
  );
}

function parseCommandInput(input) {
  const [rawCommand, rawLevel] = input.trim().split(/\s+/);
  const commandName = rawCommand?.toUpperCase() || "";

  if (!rawLevel) {
    return { commandName, level: 1 };
  }

  const level = Number(rawLevel);
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return {
      commandName,
      level: 1,
      error: "레벨은 1~3 사이의 숫자로 입력해 주세요.",
    };
  }

  return { commandName, level };
}

export default function CharacterPage() {
  const { logout, navigate, selectedCharacterId } = useApp();
  const [character, setCharacter] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const bmi = useMemo(
    () => calculateBmi(character?.height, character?.weight) || 22,
    [character]
  );

  function addEvent(message, type = "info") {
    const event = createVitalEvent(message, type);
    const nextEvents = appendStoredVitalEvent(selectedCharacterId, event);
    setEvents(nextEvents);
    return nextEvents;
  }

  async function loadCharacterEvents() {
    if (!selectedCharacterId) return;

    try {
      const eventData = await fetchCharacterSecurityEvents(selectedCharacterId, {
        limit: 20,
      });
      const serverEvents = compactDisplayEvents(
        (eventData.events || []).map(toDisplayEvent)
      );
      const localEvents = getStoredVitalEvents(selectedCharacterId);

      setEvents([...serverEvents, ...localEvents].slice(0, 20));
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }

      const localEvents = getStoredVitalEvents(selectedCharacterId);
      setEvents([
        {
          id: "event-fetch-failed",
          message: EVENT_FETCH_ERROR_MESSAGE,
          type: "warning",
        },
        ...localEvents,
      ].slice(0, 20));
    }
  }

  async function loadLatestMeasurementVitals(nextBmi = bmi) {
    const vitalData = await fetchLatestVitals(selectedCharacterId);
    const nextVitals = resolveCurrentVitals({
      measuredVitals: parseDisplayVitals(
        vitalData.monitor,
        getDefaultVitalsByBmi(nextBmi)
      ),
      bmi: nextBmi,
    });

    setVitals(nextVitals);
    setStoredVitals(selectedCharacterId, nextVitals);
    return nextVitals;
  }

  async function commitVitals(nextVitals, eventMessage, reason = "character command") {
    setVitals(nextVitals);
    setStoredVitals(selectedCharacterId, nextVitals);

    let nextEvents = getStoredVitalEvents(selectedCharacterId);
    if (eventMessage) {
      nextEvents = addEvent(eventMessage);
    }

    if (isCriticalState(nextVitals)) {
      nextEvents = appendStoredVitalEvent(
        selectedCharacterId,
        createVitalEvent(WARNING_MESSAGE, "warning")
      );
      logClientSecurityEvent({
        eventType: "ANOMALY_DETECTED",
        targetType: "character",
        targetId: selectedCharacterId,
        description: WARNING_MESSAGE,
      }).catch(() => {});
    }

    setEvents(nextEvents);
    await saveManualVitals(selectedCharacterId, nextVitals, reason, "simulation");
    await loadLatestMeasurementVitals();
    await loadCharacterEvents();
  }

  async function handleCommand(input) {
    const { commandName, level, error: commandError } = parseCommandInput(input);

    if (commandError) {
      addEvent(commandError);
      return;
    }

    if (commandName === "CLEAR_EVENTS") {
      addEvent("이벤트가 제거되었습니다.");
      return;
    }

    if (commandName === "CLEAR_EVENT_LOGS") {
      clearStoredVitalEvents(selectedCharacterId);
      setEvents([]);
      return;
    }

    if (commandName === "RESET_STATE") {
      const nextVitals = getDefaultVitalsByBmi(bmi);
      const event = createVitalEvent("상태가 초기화되었습니다.");
      clearStoredVitals(selectedCharacterId);
      clearStoredVitalEvents(selectedCharacterId);
      setStoredVitals(selectedCharacterId, nextVitals);
      setStoredVitalEvents(selectedCharacterId, [event]);
      setVitals(nextVitals);
      setEvents([event]);
      try {
        await saveManualVitals(
          selectedCharacterId,
          nextVitals,
          "RESET_STATE",
          "simulation"
        );
        await loadLatestMeasurementVitals();
        await loadCharacterEvents();
      } catch (err) {
        if (err.status === 401) logout();
        else setError(getSafeErrorMessage(err));
      }
      return;
    }

    if (!implementedCommands.includes(commandName)) {
      addEvent("알 수 없는 명령입니다.");
      return;
    }

    const nextVitals = applyCommand(
      vitals || getDefaultVitalsByBmi(bmi),
      commandName,
      bmi,
      level
    );
    const message = commandMessages[commandName] || "명령이 적용되었습니다.";
    const eventMessage = `${message} (단계 ${level})`;
    try {
      await commitVitals(nextVitals, eventMessage, commandName);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(getSafeErrorMessage(err));
    }
    logClientSecurityEvent({
      eventType: "COMMAND_APPLIED",
      targetType: "character",
      targetId: selectedCharacterId,
      description: `${commandName} 적용`,
    }).catch(() => {});
  }

  async function loadCharacterReport() {
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
      await loadCharacterEvents();

      try {
        await loadLatestMeasurementVitals(nextBmi);
      } catch (err) {
        const storedVitals = getStoredVitals(selectedCharacterId);
        setVitals(resolveCurrentVitals({ storedVitals, bmi: nextBmi }));
        setError(err.status === 404 ? "" : getSafeErrorMessage(err));
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
    loadCharacterReport();
  }, [selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId || !character) return undefined;

    const timer = window.setInterval(() => {
      loadCharacterEvents();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [character, logout, selectedCharacterId]);

  const displayVitals = toDisplayVitals(vitals || getDefaultVitalsByBmi(bmi));

  return (
    <MonitorFrame
      title="VITACORE CHARACTER"
      patientName={character?.name || "NAME"}
      patientSex={formatGender(character?.gender)}
      patientAge={character?.age || "00"}
      alarm={error || (isLoading ? "캐릭터 정보를 불러오는 중입니다." : "")}
      actions={[
        { label: "BACK", onClick: () => navigate(routes.characters) },
        { label: "VITAL LINK", onClick: () => navigate(routes.vitals) },
        { label: "HELP", onClick: () => navigate(routes.help) },
      ]}
    >
      <CharacterViewer
        character={toCharacterReport(character)}
        currentVitals={vitals || getDefaultVitalsByBmi(bmi)}
        vitals={displayVitals}
        status={{
          title: character ? "MONITORING" : "CHARACTER WAITING",
          description:
            "Latest vitals and event logs are synced with this character.",
        }}
        events={events}
        onCommand={handleCommand}
      />
    </MonitorFrame>
  );
}
