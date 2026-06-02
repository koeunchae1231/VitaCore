import { useEffect, useState } from "react";

import {
  getCharacterImage,
  getCharacterState,
  isCriticalState,
} from "../utils/vitals";

const DEFAULT_CHARACTER = {
  name: "NAME",
  height: "000cm",
  weight: "00kg",
  bmi: "00.0",
};

const DEFAULT_DISPLAY_VITALS = {
  hr: "000",
  spo2: "00",
  rr: "00",
  bp: "00 / 00",
  map: "(00)",
  temp: "00.0",
};

const DEFAULT_STATUS = {
  title: "현재 상태",
  description: "아직 기록된 상태가 없습니다.",
};

const breathingIntervals = {
  LOW_TEMP: 1300,
  LOW_BP: 1300,
  NORMAL: 850,
  HIGH_TEMP: 500,
  HIGH_BP: 500,
};

export default function CharacterViewer({
  character = DEFAULT_CHARACTER,
  currentVitals,
  vitals = DEFAULT_DISPLAY_VITALS,
  status = DEFAULT_STATUS,
  events = [],
  onCommand,
}) {
  const [command, setCommand] = useState("");
  const [breathingFrame, setBreathingFrame] = useState("U");
  const characterState = currentVitals ? getCharacterState(currentVitals) : "NORMAL";
  const isCritical = currentVitals ? isCriticalState(currentVitals) : false;
  const characterImage = currentVitals
    ? getCharacterImage(currentVitals, breathingFrame)
    : null;

  useEffect(() => {
    setBreathingFrame("U");
    const intervalMs =
      breathingIntervals[characterState] || breathingIntervals.NORMAL;
    const timer = window.setInterval(() => {
      setBreathingFrame((current) => (current === "U" ? "D" : "U"));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [characterState]);

  function submitCommand(event) {
    event.preventDefault();
    const nextCommand = command.trim().toUpperCase();
    if (!nextCommand || !onCommand) return;
    onCommand(nextCommand);
    setCommand("");
  }

  return (
    <div className="character-viewer">
      <section className="character-visual-panel">
        <div className="character-avatar-area" data-state={characterState}>
          {characterImage ? (
            <img
              className="character-avatar-image"
              src={characterImage}
              alt={`${characterState} character`}
            />
          ) : (
            <div className="character-avatar-placeholder">
              <span>CHARACTER</span>
            </div>
          )}
        </div>

        <form className="character-cmd-panel" onSubmit={submitCommand}>
          <dl className="character-cmd-list">
            <div>
              <dt>HR</dt>
              <dd>{vitals.hr}</dd>
            </div>
            <div>
              <dt>SpO2</dt>
              <dd>{vitals.spo2}</dd>
            </div>
            <div>
              <dt>RR</dt>
              <dd>{vitals.rr}</dd>
            </div>
            <div>
              <dt>BP</dt>
              <dd>{vitals.bp}</dd>
            </div>
            <div>
              <dt>MAP</dt>
              <dd>{vitals.map}</dd>
            </div>
            <div>
              <dt>TEMP</dt>
              <dd>{vitals.temp}</dd>
            </div>
          </dl>

          <div className="character-command-row">
            <input
              className="input character-cmd-input"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="APPLY_OXYGEN 1"
              aria-label="Character command"
            />
            <button className="btn btn-primary btn-sm" type="submit">
              APPLY
            </button>
          </div>
        </form>
      </section>

      <section className="character-report-panel surface-light">
        <h2 className="character-report-title">CHARACTER REPORT</h2>

        <div className="character-profile-grid">
          <p>
            <strong>HEIGHT:</strong>
            <span>{character.height}</span>
          </p>
          <p>
            <strong>WEIGHT:</strong>
            <span>{character.weight}</span>
          </p>
          <p>
            <strong>BMI:</strong>
            <span>{character.bmi}</span>
          </p>
        </div>

        <div className="character-status-block">
          <h3>CURRENT STATUS</h3>
          <p className="character-status-title">
            {isCritical ? "위험 경고" : status.title}
          </p>
          <p className="character-status-description">
            {isCritical
              ? "바이탈이 생존 가능 안전 범위를 벗어났습니다."
              : status.description}
          </p>
        </div>

        <div className="character-event-block">
          <h3>[EVENT]</h3>

          {events.length === 0 ? (
            <article className="character-event-item">
              <p className="character-event-description">
                아직 적용된 시뮬레이션 이벤트가 없습니다.
              </p>
            </article>
          ) : (
            events.map((event, index) => (
              <article
                className={`character-event-item ${event.type || ""}`}
                key={`${event.message}-${index}`}
              >
                <p className="character-event-description">{event.message}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
