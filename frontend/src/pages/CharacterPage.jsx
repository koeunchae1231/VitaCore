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
  commandMessages,
  parseCommandInput,
} from "../utils/characterCommands";
import {
  compactDisplayEvents,
  isUnsafeEventMessage,
  toDisplayEvent,
} from "../utils/securityEventDisplay";
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

const VITAL_SAVE_KEYS = ["HR", "SBP", "DBP", "RR", "SPO2", "TEMP"];

const EVENT_FETCH_ERROR_MESSAGE = "이벤트 로그를 불러오지 못했습니다.";

function getSafeErrorMessage(err, fallback = "요청 처리 중 오류가 발생했습니다.") {
  const message = String(err?.message || "");
  return isUnsafeEventMessage(message) ? fallback : message;
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
