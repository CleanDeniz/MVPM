const API_BASE = import.meta.env.VITE_API_BASE || "https://mvpm-tu8r.onrender.com";

function initHeaders() {
  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData || "";
  return {
    "Content-Type": "application/json",
    "x-telegram-init-data": initData
  };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: initHeaders(),
    credentials: "include"
  });
  // Если бэкенд вернул не JSON (например, 500 HTML), не ломаемся
  const txt = await res.text().catch(() => "");
  try { return JSON.parse(txt); } catch { return { ok: false, error: "BAD_JSON", raw: txt }; }
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: initHeaders(),
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  const txt = await res.text().catch(() => "");
  try { return JSON.parse(txt); } catch { return { ok: false, error: "BAD_JSON", raw: txt }; }
}

// ───── админ-утилиты ─────
function adminHeaders(secret) {
  return {
    ...initHeaders(),
    "x-admin-secret": secret || ""
  };
}

export async function adminPost(path, body, secret) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: adminHeaders(secret),
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  const txt = await res.text().catch(() => "");
  try { return JSON.parse(txt); } catch { return { ok: false, error: "BAD_JSON", raw: txt }; }
}

export async function adminPatch(path, body, secret) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: adminHeaders(secret),
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  const txt = await res.text().catch(() => "");
  try { return JSON.parse(txt); } catch { return { ok: false, error: "BAD_JSON", raw: txt }; }
}

export async function adminGet(path, secret) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: adminHeaders(secret),
    credentials: "include"
  });
  const txt = await res.text().catch(() => "");
  try { return JSON.parse(txt); } catch { return { ok: false, error: "BAD_JSON", raw: txt }; }
}
