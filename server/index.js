import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { checkTelegramInitData, extractUser } from "./verifyTelegram.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me";

const allowedOrigins = [
  "https://mvpm-puce.vercel.app",
  "https://mvpm-puce.vercel.app/",
  "https://mvpm-2zg518g2r-cleandenizs-projects.vercel.app",
  "https://mvpm-2zg518g2r-cleandenizs-projects.vercel.app/",
  "https://web.telegram.org",
  "https://t.me"
];

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ✅ Настройка CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("❌ CORS blocked for:", origin);
      return callback(null, false);
    },
    credentials: true,
  })
);

// ✅ Разрешаем preflight-запросы OPTIONS на все маршруты
app.options("*", cors());

app.use(express.json());

// Лог запросов
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ Telegram guard для /api
app.use("/api", (req, res, next) => {
  // Разрешаем preflight-запросы без авторизации
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://mvpm-puce.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-telegram-init-data");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }

  if (req.path.startsWith("/admin")) return next();

  const initData = req.header("x-telegram-init-data");
  console.log("initData:", initData ? initData.slice(0, 200) : "NO DATA");

  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://mvpm-puce.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (!initData || !checkTelegramInitData(initData, BOT_TOKEN)) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const tgUser = extractUser(initData);
  if (!tgUser) {
    return res.status(401).json({ ok: false, error: "NO_USER" });
  }

  req.user = tgUser;
  next();
});

app.use("/api", userRoutes());

app.use("/api/admin", (req, res, next) => {
  const secret = req.header("x-admin-secret");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://mvpm-puce.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ ok: false, error: "ADMIN_UNAUTHORIZED" });
  }
  req.isAdmin = true;
  next();
});
app.use("/api/admin", adminRoutes());

app.get("/", (_req, res) => res.send("TMA Bonus Server (Supabase) OK"));

app.listen(PORT, () => console.log(`✅ Server on :${PORT}`));
