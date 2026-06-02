import { useEffect, useState } from "react";

import { useApp } from "../App";
import { fetchCharacter } from "../api/characterApi";
import CommandHelpPanel from "../components/CommandHelpPanel";
import MonitorFrame from "../components/MonitorFrame";
import { routes } from "../router";

function formatGender(gender) {
  if (!gender) return "MF";
  return gender.slice(0, 1).toUpperCase();
}

export default function HelpPage() {
  const { logout, navigate, selectedCharacterId } = useApp();
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCharacter() {
      if (!selectedCharacterId) {
        setError("Select a character first.");
        return;
      }

      try {
        const data = await fetchCharacter(selectedCharacterId);
        if (mounted) setCharacter(data.character);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        if (mounted) setError(err.message);
      }
    }

    loadCharacter();

    return () => {
      mounted = false;
    };
  }, [selectedCharacterId, logout]);

  return (
    <MonitorFrame
      title="VITACORE HELP"
      patientName={character?.name || "NAME"}
      patientSex={formatGender(character?.gender)}
      patientAge={character?.age || "00"}
      alarm={error || "Command names match the implemented vital simulator."}
      actions={[
        { label: "BACK", onClick: () => navigate(routes.characterReport) },
      ]}
    >
      <CommandHelpPanel />
    </MonitorFrame>
  );
}
