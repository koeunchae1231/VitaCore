import {
  apiRequest,
  clearSession,
  setSelectedCharacterId,
  setStoredUser,
  setToken,
} from "./client";

export async function requestVerification(email) {
  return apiRequest("/auth/request-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmail({ email, code }) {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function signup({ name, email, password }) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setStoredUser(data.user);
  setSelectedCharacterId(null);
  return data;
}

export async function sendFindEmailCode({ name, email }) {
  return apiRequest("/auth/find-email/send-code", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

export async function verifyFindEmail({ name, email, code }) {
  return apiRequest("/auth/find-email/verify", {
    method: "POST",
    body: JSON.stringify({ name, email, code }),
  });
}

export async function sendPublicPasswordResetCode({ email }) {
  return apiRequest("/auth/password-reset/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPublicPasswordReset({ email, code, newPassword }) {
  return apiRequest("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}

export async function fetchMe() {
  return apiRequest("/me");
}

export async function deleteAccount({ password }) {
  return apiRequest("/account/delete", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function sendEmailChangeCode({ email }) {
  return apiRequest("/account/email/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function changeEmail({ email, code }) {
  return apiRequest("/account/email/change", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function sendPasswordResetCode() {
  return apiRequest("/account/password/send-code", {
    method: "POST",
  });
}

export async function resetPassword({ code, newPassword }) {
  return apiRequest("/account/password/reset", {
    method: "POST",
    body: JSON.stringify({ code, newPassword }),
  });
}

export function logout() {
  clearSession();
}
