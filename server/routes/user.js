import express from "express";
import { supabase } from "../index.js";

export default function userRoutes() {
  const router = express.Router();

  // ───────────────────────────────
  // Получение текущего пользователя
  // ───────────────────────────────
  router.get("/me", async (req, res) => {
    const u = req.user;

    const { data: existing, error: err1 } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", u.id)
      .maybeSingle();

    if (err1) return res.status(500).json({ ok: false, error: err1.message });

    if (!existing) {
      const { error: err2 } = await supabase.from("users").insert([
        {
          tg_id: u.id,
          first_name: u.first_name || null,
          last_name: u.last_name || null,
          username: u.username || null,
          balance: 0,
        },
      ]);
      if (err2) return res.status(500).json({ ok: false, error: err2.message });
    }

    const { data: me, error: err3 } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", u.id)
      .single();

    if (err3) return res.status(500).json({ ok: false, error: err3.message });
    res.json({ ok: true, user: me });
  });

  // ───────────────────────────────
  // Telegram-авторизация (без телефона)
  // ───────────────────────────────
  router.post("/telegram-auth", async (req, res) => {
    const { tg_id, name, username } = req.body || {};
    if (!tg_id) return res.status(400).json({ ok: false, error: "NO_TG_ID" });

    const { data: user, error } = await supabase
      .from("users")
      .upsert({ tg_id, first_name: name, username }, { onConflict: "tg_id" })
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, user });
  });

  // ───────────────────────────────
  // Каталог услуг
  // ───────────────────────────────
  router.get("/services", async (_req, res) => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("visible", true)
      .order("id", { ascending: false });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, services: data });
  });

  // ───────────────────────────────
  // Мои услуги
  // ───────────────────────────────
  router.get("/my-services", async (req, res) => {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, created_at, services:services(* )")
      .eq("user_id", req.user.id)
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    const items = (data || []).map((r) => ({
      ...r.services,
      purchased_at: r.created_at,
    }));

    res.json({ ok: true, items });
  });

  // ───────────────────────────────
  // Покупка услуги
  // ───────────────────────────────
  router.post("/purchase/:id", async (req, res) => {
    const serviceId = Number(req.params.id);
    const { error } = await supabase.rpc("purchase_service", {
      p_user_id: req.user.id,
      p_service_id: serviceId,
    });

    if (error) {
      const map = {
        SERVICE_NOT_FOUND: 404,
        ALREADY_PURCHASED: 409,
        INSUFFICIENT_FUNDS: 402,
      };
      const code = map[error.message] || 500;
      return res.status(code).json({ ok: false, error: error.message });
    }

    res.json({ ok: true });
  });

  return router;
}
