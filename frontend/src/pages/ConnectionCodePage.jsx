import { useEffect, useState } from "react";

import { fetchCharacter } from "../api/characterApi";
import { createConnectionCode, fetchConnectionCode } from "../api/connectionApi";
import { useApp } from "../App";
import ConnectionCodeDisplay from "../components/ConnectionCodeDisplay";
import MonitorFrame from "../components/MonitorFrame";
import { routes } from "../router";

function formatRemainingTime(expiresAt, now = Date.now()) {
  if (!expiresAt) return "--:--";

  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "00:00";

  const seconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

export default function ConnectionCodePage() {
  const { logout, navigate, selectedCharacterId } = useApp();
  const [codeData, setCodeData] = useState(null);
  const [character, setCharacter] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateCode() {
    if (!selectedCharacterId) {
      setError("Select a character first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const [data, characterData] = await Promise.all([
        createConnectionCode(Number(selectedCharacterId)),
        fetchCharacter(selectedCharacterId),
      ]);
      setCharacter(data.character || characterData.character);
      setCodeData(data);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleCreateCode();
  }, [selectedCharacterId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!codeData?.code) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const nextData = await fetchConnectionCode(codeData.code);
        setCodeData((current) => ({ ...current, ...nextData }));
        if (nextData.character) setCharacter(nextData.character);
      } catch (err) {
        if (err.status === 401) logout();
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [codeData?.code, logout]);

  useEffect(() => {
    if (!codeData?.expiresAt) return;
    if (new Date(codeData.expiresAt).getTime() <= now) {
      navigate(routes.connection);
    }
  }, [codeData?.expiresAt, navigate, now]);

  return (
    <MonitorFrame
      title="VITACORE CONNECTION CODE"
      patientName={character?.name || "NAME"}
      patientSex={character?.gender?.slice(0, 1).toUpperCase() || "MF"}
      patientAge={character?.age || "00"}
      alarm={error || (isLoading ? "Generating connection code" : "")}
      actions={[
        { label: "BACK", onClick: () => navigate(routes.vitals) },
      ]}
    >
      <ConnectionCodeDisplay
        code={codeData?.code}
        remainingTime={formatRemainingTime(codeData?.expiresAt, now)}
        character={character || codeData?.character}
        createdAt={codeData?.createdAt}
        expiresAt={codeData?.expiresAt}
        isConnected={Boolean(codeData?.isConnected)}
        device={codeData?.device}
        usedAt={codeData?.usedAt}
        isLoading={isLoading}
      />
    </MonitorFrame>
  );
}
