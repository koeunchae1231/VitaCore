import { apiRequest } from "./client";

export async function fetchCharacters() {
  return apiRequest("/characters");
}

export async function createCharacter(character) {
  return apiRequest("/characters", {
    method: "POST",
    body: JSON.stringify(character),
  });
}

export async function fetchCharacter(characterId) {
  return apiRequest(`/characters/${characterId}`);
}

export async function deleteCharacter(characterId) {
  return apiRequest(`/characters/${characterId}`, {
    method: "DELETE",
  });
}
