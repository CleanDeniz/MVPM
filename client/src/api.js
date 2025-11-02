const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function initHeaders() {
  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData || "";
  return { "Content-Type": "application/json", "x-telegram-init-data": initData };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: initHeaders() });
  return res.json();
}
export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: initHeaders(),
    body: JSON.stringify(body || {})
  });
  return res.json();
}

// Admin (MVP header secret)
export function adminHeaders(secret) {
  return { "Content-Type": "application/json", "x-admin-secret": secret };
}
export async function adminPost(path, body, secret) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: adminHeaders(secret),
    body: JSON.stringify(body || {})
  });
  return res.json();
}
export async function adminPatch(path, body, secret) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: adminHeaders(secret),
    body: JSON.stringify(body || {})
  });
  return res.json();
}
export async function adminGet(path, secret) {
  const res = await fetch(`${API_BASE}${path}`, { headers: adminHeaders(secret) });
  return res.json();
}
