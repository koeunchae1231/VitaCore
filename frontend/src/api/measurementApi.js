import { apiRequest } from "./client";

export async function fetchLatestVitals(characterId, options = {}) {
  return apiRequest(`/characters/${characterId}/vitals/latest`, {
    signal: options.signal,
  });
}

export async function fetchVitalHistory(characterId, params = {}, options = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/characters/${characterId}/vitals/history${suffix}`, {
    signal: options.signal,
  });
}

export async function createManualCorrection(correction) {
  return apiRequest("/measurements/manual-correction", {
    method: "POST",
    body: JSON.stringify(correction),
  });
}
