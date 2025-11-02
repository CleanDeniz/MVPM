import crypto from "crypto";

/**
 * Разбирает initData в объект и сохраняет порядок параметров.
 */
export function parseInitData(initData) {
  try {
    const params = new URLSearchParams(initData);
    const data = {};
    for (const [k, v] of params) data[k] = v;
    return { params, data };
  } catch (e) {
    console.error("❌ parseInitData error:", e.message);
    return { params: new URLSearchParams(), data: {} };
  }
}

/**
 * Проверяет подпись Telegram WebApp (Mini App) по алгоритму HMAC-SHA256.
 * Возвращает true, если подпись корректна, иначе false.
 */
export function checkTelegramInitData(initData, botToken) {
  try {
    if (!initData || !botToken) {
      console.warn("⚠️ Missing initData or botToken");
      return false;
    }

    const { params } = parseInitData(initData);
    const hash = params.get("hash");
    if (!hash) {
      console.warn("⚠️ Missing hash in initData");
      return false;
    }

    // Составляем data_check_string согласно документации Telegram:
    // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    const pairs = [];
    for (const [k, v] of params) {
      if (k === "hash") continue;
      pairs.push(`${k}=${v}`);
    }
    pairs.sort();
    const dataCheckString = pairs.join("\n");

    // Создаём секретный ключ на основе botToken
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Вычисляем контрольную подпись
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const ok = crypto.timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(hash, "hex")
    );

    if (!ok) {
      console.warn("❌ Invalid Telegram signature. Probably wrong BOT_TOKEN or wrong bot opened Mini App.");
    } else {
      console.log("✅ Telegram signature OK");
    }

    return ok;
  } catch (e) {
    console.error("❌ checkTelegramInitData error:", e.message);
    return false;
  }
}

/**
 * Извлекает объект пользователя из initData.
 * Возвращает null, если не удалось распарсить.
 */
export function extractUser(initData) {
  try {
    const { params } = parseInitData(initData);
    const raw = params.get("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("❌ extractUser error:", e.message);
    return null;
  }
}
