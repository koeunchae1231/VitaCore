// frontend/src/components/MonitorFrame.jsx

import { useEffect, useState } from "react";

function formatPatientAge(age) {
  const normalizedAge = String(age ?? "").trim();
  return normalizedAge || "00";
}

export default function MonitorFrame({
  title = "VITACORE",
  patientName = "NAME",
  patientSex = "MF",
  patientAge = "00",
  alarm = "",
  actions = [],
  children,
}) {
  const [liveTime, setLiveTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setLiveTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content monitor-frame">
          <header className="monitor-header">
            <p className="monitor-title">{title}</p>
            <div className="monitor-meta">
              <span>
                PATIENT: {patientName} {patientSex}/{formatPatientAge(patientAge)}
              </span>
              <span>TIME: {liveTime.toLocaleString()}</span>
            </div>
          </header>

          <section className="monitor-body">{children}</section>

          <footer className="monitor-footer">
            <p className="monitor-alarm">
              ALARM:
              {alarm && <span className="monitor-alarm-message"> {alarm}</span>}
            </p>

            <div className="monitor-actions">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={`btn btn-sm ${
                    action.label === "BACK" ? "btn-back" : ""
                  } ${action.className || ""}`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
