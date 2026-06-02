const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const TOKEN_KEY = "vitacore.jwt";
const USER_KEY = "vitacore.user";
const SELECTED_CHARACTER_KEY = "vitacore.selectedCharacterId";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getSelectedCharacterId() {
  return localStorage.getItem(SELECTED_CHARACTER_KEY);
}

export function setSelectedCharacterId(characterId) {
  if (characterId) {
    localStorage.setItem(SELECTED_CHARACTER_KEY, String(characterId));
  } else {
    localStorage.removeItem(SELECTED_CHARACTER_KEY);
  }
}

export function clearSession() {
  setToken(null);
  setStoredUser(null);
  setSelectedCharacterId(null);
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Unexpected server response." };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        (response.status === 401
          ? "Your session has expired. Please sign in again."
          : "API request failed.")
    );
    error.status = response.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
}
