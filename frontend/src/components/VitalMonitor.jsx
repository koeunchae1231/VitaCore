import { useEffect, useState } from "react";

import {
  appendVitalSeriesPoint,
  generateInitialVitalSeries,
} from "../utils/vitalCharts";

const DEFAULT_DISPLAY_VITALS = {
  hr: "000",
  spo2: "000",
  rr: "000",
  temp: "00.0",
  bp: "SBP/DBP",
  map: "(MAP)",
};

const DEFAULT_RAW_VITALS = {
  HR: 75,
  SBP: 118,
  DBP: 76,
  RR: 16,
  SPO2: 98,
  TEMP: 36.7,
};

function toPoints(series, valueKey = "value", min, max) {
  const safeMin = min ?? Math.min(...series.map((point) => point[valueKey]));
  const safeMax = max ?? Math.max(...series.map((point) => point[valueKey]));
  const range = Math.max(1, safeMax - safeMin);

  return series
    .map((point, index) => {
      const x = (index / Math.max(1, series.length - 1)) * 200;
      const y = 59 - ((point[valueKey] - safeMin) / range) * 54;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function VitalChart({ title, value, colorClass, children }) {
  return (
    <article className={`vital-wave-row ${colorClass}`}>
      <div className="vital-wave-label">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <svg
        className="vital-wave-stream"
        viewBox="0 0 200 64"
        role="img"
        aria-label={`${title} simulated chart`}
      >
        <line className="vital-wave-midline" x1="0" x2="200" y1="32" y2="32" />
        {children}
      </svg>
    </article>
  );
}

function EditableVitalValue({
  field,
  value,
  className,
  ariaLabel,
  onManualChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEditing() {
    if (!onManualChange) return;
    setDraft(value);
    setIsEditing(true);
  }

  function commit() {
    if (!isEditing) return;
    setIsEditing(false);
    onManualChange(field, draft);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      setIsEditing(false);
      setDraft(value);
    }
  }

  if (isEditing) {
    return (
      <input
        className={`vital-edit-input ${className}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        autoFocus
      />
    );
  }

  return (
    <button
      className={`vital-edit-button ${className}`}
      type="button"
      onClick={startEditing}
      aria-label={ariaLabel}
      disabled={!onManualChange}
    >
      {value}
    </button>
  );
}

export default function VitalMonitor({
  vitals = DEFAULT_DISPLAY_VITALS,
  rawVitals = DEFAULT_RAW_VITALS,
  onManualChange,
}) {
  const [chartSeries, setChartSeries] = useState(() =>
    generateInitialVitalSeries(rawVitals)
  );
  const [tick, setTick] = useState(100);

  useEffect(() => {
    setChartSeries(generateInitialVitalSeries(rawVitals));
    setTick(100);
  }, [
    rawVitals.HR,
    rawVitals.SBP,
    rawVitals.DBP,
    rawVitals.RR,
    rawVitals.SPO2,
    rawVitals.TEMP,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((currentTick) => {
        const nextTick = currentTick + 1;
        setChartSeries((currentSeries) =>
          appendVitalSeriesPoint(currentSeries, rawVitals, nextTick)
        );
        return nextTick;
      });
    }, 90);

    return () => window.clearInterval(timer);
  }, [
    rawVitals.HR,
    rawVitals.SBP,
    rawVitals.DBP,
    rawVitals.RR,
    rawVitals.SPO2,
    rawVitals.TEMP,
  ]);

  return (
    <div className="vital-monitor">
      <section className="vital-graph-panel">
        <div className="vital-monitor-screen">
          <VitalChart title="ECG" value={vitals.hr} colorClass="vital-wave-ecg">
            <polyline
              points={toPoints(
                chartSeries.hr,
                "value",
                Number(rawVitals.HR) - 30,
                Number(rawVitals.HR) + 48
              )}
            />
          </VitalChart>

          <VitalChart
            title="SpO2"
            value={vitals.spo2}
            colorClass="vital-wave-spo2"
          >
            <polyline points={toPoints(chartSeries.spo2, "value", 88, 100)} />
          </VitalChart>

          <VitalChart title="RESP" value={vitals.rr} colorClass="vital-wave-resp">
            <polyline
              points={toPoints(
                chartSeries.rr,
                "value",
                Number(rawVitals.RR) - 8,
                Number(rawVitals.RR) + 8
              )}
            />
          </VitalChart>

          <VitalChart title="ART" value={vitals.bp} colorClass="vital-wave-art">
            <polyline
              points={toPoints(
                chartSeries.bp,
                "sbp",
                Number(rawVitals.SBP) - 18,
                Number(rawVitals.SBP) + 22
              )}
            />
          </VitalChart>
        </div>
      </section>

      <aside className="vital-side-panel">
        <div className="vital-side-row">
          <div>
            <p className="vital-label vital-hr">HR</p>
            <EditableVitalValue
              field="HR"
              value={vitals.hr}
              className="vital-number vital-hr vital-number-large"
              ariaLabel="Edit HR"
              onManualChange={onManualChange}
            />
          </div>

          <div>
            <p className="vital-label">TEMP</p>
            <EditableVitalValue
              field="TEMP"
              value={vitals.temp}
              className="vital-number vital-temp vital-number-medium"
              ariaLabel="Edit TEMP"
              onManualChange={onManualChange}
            />
          </div>
        </div>

        <div className="vital-side-item">
          <p className="vital-label vital-spo2">SpO2</p>
          <EditableVitalValue
            field="SPO2"
            value={vitals.spo2}
            className="vital-number vital-spo2 vital-number-large"
            ariaLabel="Edit SpO2"
            onManualChange={onManualChange}
          />
        </div>

        <div className="vital-side-item">
          <p className="vital-label vital-rr">RR</p>
          <EditableVitalValue
            field="RR"
            value={vitals.rr}
            className="vital-number vital-rr vital-number-large"
            ariaLabel="Edit RR"
            onManualChange={onManualChange}
          />
        </div>

        <div className="vital-side-item vital-bp-block">
          <p className="vital-label vital-bp">BP</p>
          <EditableVitalValue
            field="BP"
            value={vitals.bp}
            className="vital-number vital-bp vital-bp-text"
            ariaLabel="Edit BP"
            onManualChange={onManualChange}
          />
          <p className="vital-number vital-bp vital-map-text">{vitals.map}</p>
        </div>
      </aside>
    </div>
  );
}
