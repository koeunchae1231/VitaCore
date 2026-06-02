import { useEffect, useState } from "react";

import { deleteCharacter, fetchCharacters } from "../api/characterApi";
import { useApp } from "../App";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

function formatCharacterLabel(character) {
  const gender = character.gender ? character.gender.slice(0, 1).toUpperCase() : "N";
  return `${character.name}   ${gender} / ${character.age}`;
}

export default function CharacterListPage() {
  const {
    logout,
    navigate,
    selectedCharacterId,
    setSelectedCharacterId,
  } = useApp();
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadCharacters() {
    setError("");
    setIsLoading(true);

    try {
      const data = await fetchCharacters();
      setCharacters(data.characters || []);
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

  async function handleDelete(characterId) {
    setError("");

    try {
      await deleteCharacter(characterId);
      if (String(characterId) === String(selectedCharacterId)) {
        setSelectedCharacterId(null);
      }
      await loadCharacters();
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    if (
      selectedCharacterId &&
      characters.length > 0 &&
      !characters.some(
        (character) => String(character.id) === String(selectedCharacterId)
      )
    ) {
      setSelectedCharacterId(null);
    }
  }, [characters, selectedCharacterId, setSelectedCharacterId]);

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page character-page">
          <PageHeader title="CHARACTER LIST" />

          <div className="btn-group character-menu-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate(routes.createCharacter)}
            >
              NEW CHARACTER
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={loadCharacters}
            >
              REFRESH
            </button>
          </div>

          <section className="list-box character-list-box">
            {isLoading && <p className="message-muted">Loading characters...</p>}
            {error && <p className="message message-error">{error}</p>}
            {!isLoading && !error && characters.length === 0 && (
              <p className="message-muted">No characters yet.</p>
            )}

            <div className="menu-card">
              {characters.map((character) => (
                <div className="character-list-item" key={character.id}>
                  <button
                    className={`btn btn-block ${
                      String(character.id) === String(selectedCharacterId)
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    type="button"
                    onClick={() => {
                      setSelectedCharacterId(character.id);
                      navigate(routes.vitals);
                    }}
                  >
                    {formatCharacterLabel(character)}
                  </button>
                  <button
                    className="btn btn-danger character-delete-button"
                    type="button"
                    onClick={() => handleDelete(character.id)}
                  >
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="btn-group character-list-footer">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate(routes.accountSettings)}
            >
              ACCOUNT SETTINGS
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={logout}
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
