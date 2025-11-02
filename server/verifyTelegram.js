import crypto from "crypto";

export function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const data = {};
  for (const [k, v] of params) data[k] = v;
  return { params, data };
}

export function checkTelegramInitData(initData, botToken) {
  const { params } = parseInitData(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  const pairs = [];
  for (const [k, v] of params) {
    if (k === "hash") continue;
    pairs.push(`${k}=${v}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hash));
}

export function extractUser(initData) {
  const { params } = parseInitData(initData);
  const raw = params.get("user");
  if (!raw) return null;
  return JSON.parse(raw);
}
