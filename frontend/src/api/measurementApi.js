import { apiRequest } from "./client";

export async function fetchLatestVitals(characterId) {
  return apiRequest(`/characters/${characterId}/vitals/latest`);
}

export async function fetchVitalHistory(characterId, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/characters/${characterId}/vitals/history${suffix}`);
}

export async function createManualCorrection(correction) {
  return apiRequest("/measurements/manual-correction", {
    method: "POST",
    body: JSON.stringify(correction),
  });
}
