import { useEffect, useState } from "react";

import { fetchCharacter } from "../api/characterApi";
import { fetchConnectionStatus } from "../api/connectionApi";
import { useApp } from "../App";
import ConnectionStatusCard from "../components/ConnectionStatusCard";
import MonitorFrame from "../components/MonitorFrame";
import { routes } from "../router";

export default function ConnectionStatusPage() {
  const { logout, navigate, selectedCharacterId } = useApp();
  const [status, setStatus] = useState(null);
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadStatus() {
    if (!selectedCharacterId) {
      setError("Select a character first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const [statusData, characterData] = await Promise.all([
        fetchConnectionStatus(selectedCharacterId),
        fetchCharacter(selectedCharacterId),
      ]);
      const nextCharacter = statusData.character || characterData.character;
      setCharacter(nextCharacter);
      setStatus(statusData);
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
    loadStatus();
  }, [selectedCharacterId]);

  return (
    <MonitorFrame
      title="VITACORE CONNECTION"
      patientName={character?.name || "NAME"}
      patientSex={character?.gender?.slice(0, 1).toUpperCase() || "MF"}
      patientAge={character?.age || "00"}
      alarm={error || (isLoading ? "Checking connection" : "")}
      actions={[
        { label: "BACK", onClick: () => navigate(routes.vitals) },
        { label: "CODE", onClick: () => navigate(routes.connectionCode) },
      ]}
    >
      <ConnectionStatusCard
        isConnected={Boolean(status?.isConnected)}
        character={character}
        deviceName={status?.device?.deviceName}
        deviceIdentifier={status?.device?.deviceIdentifier}
        connectedAt={status?.device?.connectedAt}
        lastSync={status?.device?.lastActiveAt || status?.display?.lastSync}
      />
    </MonitorFrame>
  );
}
