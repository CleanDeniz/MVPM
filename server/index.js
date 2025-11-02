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
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ────────────────────────────────────────────────────────────────
// Middlewares
// ────────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// ────────────────────────────────────────────────────────────────
// Telegram guard for /api/*
// ────────────────────────────────────────────────────────────────
app.use("/api", (req, res, next) => {
  // Админ-роуты не требуют Telegram-авторизации
  if (req.path.startsWith("/admin")) return next();

  const initData = req.header("x-telegram-init-data");

  // 👇 Лог для диагностики
  console.log("initData:", initData ? initData.slice(0, 200) : "NO DATA");

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

// ────────────────────────────────────────────────────────────────
// User & Admin routes
// ────────────────────────────────────────────────────────────────
app.use("/api", userRoutes());

app.use("/api/admin", (req, res, next) => {
  const secret = req.header("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ ok: false, error: "ADMIN_UNAUTHORIZED" });
  }
  req.isAdmin = true;
  next();
});
app.use("/api/admin", adminRoutes());

// ────────────────────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.send("TMA Bonus Server (Supabase) OK"));

// ────────────────────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server on :${PORT}`));
