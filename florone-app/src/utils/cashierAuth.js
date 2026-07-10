const TOKEN_KEY = "floravan-cashier-token";

export function getCashierToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setCashierToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearCashierToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getCashierToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
