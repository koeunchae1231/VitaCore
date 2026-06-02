import { apiRequest } from "./client";

export async function logClientSecurityEvent(event) {
  return apiRequest("/security-events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function fetchCharacterSecurityEvents(characterId, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/characters/${characterId}/security-events${suffix}`);
}
