import { WARNING_MESSAGE } from "./vitals";

export const EVENT_DISPLAY_MESSAGES = {
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

export function isUnsafeEventMessage(message) {
  const value = String(message || "");
  return (
    !value ||
    /<!doctype|<html|Cannot GET|characterId=|vitalCode=|source_type=|measured_at=|created_at=/i.test(
      value
    )
  );
}

export function getEventMessage(event) {
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

export function compactDisplayEvents(events) {
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

export function toDisplayEvent(event) {
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
