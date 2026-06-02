import { apiRequest } from "./client";

export async function createConnectionCode(characterId) {
  return apiRequest("/connection-codes", {
    method: "POST",
    body: JSON.stringify({ characterId }),
  });
}

export async function fetchConnectionCode(code) {
  return apiRequest(`/connection-codes/${encodeURIComponent(code)}`);
}

export async function verifyConnectionCode({
  code,
  deviceIdentifier,
  deviceName,
}) {
  return apiRequest("/connection-codes/verify", {
    method: "POST",
    body: JSON.stringify({ code, deviceIdentifier, deviceName }),
  });
}

export async function fetchConnectionStatus(characterId) {
  return apiRequest(`/characters/${characterId}/connection-status`);
}
