import express from "express";
import { supabase } from "../index.js";

export default function adminRoutes() {
  const router = express.Router();

  router.get("/whoami", (_req, res) => res.json({ ok: true, admin: true }));

  router.post("/bonus", async (req, res) => {
    const { phone, amount, reason } = req.body || {};
    if (!phone || !Number.isInteger(amount)) {
      return res.status(400).json({ ok: false, error: "PHONE_AND_AMOUNT_REQUIRED" });
    }
    const { error } = await supabase.rpc("grant_bonus_by_phone", {
      p_phone: phone,
      p_amount: amount,
      p_reason: reason || "admin"
    });
    if (error) {
      const code = error.message === "USER_NOT_FOUND" ? 404 : 500;
      return res.status(code).json({ ok: false, error: error.message });
    }
    res.json({ ok: true });
  });

  router.post("/service", async (req, res) => {
    const { id, title, partner, price, description, visible = 1 } = req.body || {};
    if (!title || !Number.isInteger(price)) {
      return res.status(400).json({ ok: false, error: "TITLE_AND_PRICE_REQUIRED" });
    }
    if (id) {
      const { error } = await supabase.from("services").update({
        title, partner: partner || null, price, description: description || null, visible: !!visible
      }).eq("id", id);
      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.json({ ok: true, id });
    } else {
      const { data, error } = await supabase.from("services").insert([{
        title, partner: partner || null, price, description: description || null, visible: !!visible
      }]).select("id").single();
      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.json({ ok: true, id: data.id });
    }
  });

  router.patch("/service/:id/visibility", async (req, res) => {
    const id = Number(req.params.id);
    const { visible } = req.body || {};
    const { error } = await supabase.from("services").update({ visible: !!visible }).eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true });
  });

  router.get("/users", async (_req, res) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, phone, balance, created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, users: data });
  });

  return router;
}
