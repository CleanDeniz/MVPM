import { useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import "./styles.css";
import { apiGet } from "./api.js";
import PhoneGate from "./pages/PhoneGate.jsx";
import Balance from "./pages/Balance.jsx";
import Catalog from "./pages/Catalog.jsx";
import MyServices from "./pages/MyServices.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("balance");

  async function loadMe() {
    const r = await apiGet("/api/me");
    if (r.ok) setMe(r.user);
  }

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.expand();
    tg?.ready();
    loadMe();
  }, []);

  // Авторизация теперь по Telegram ID, без телефона
  const authOk = !!me?.tg_id;

  return (
    <>
      {!me ? (
        <div className="p-4">Загрузка…</div>
      ) : !authOk ? (
        <PhoneGate onDone={loadMe} />
      ) : (
        <>
          {tab === "balance" && <Balance me={me} />}
          {tab === "catalog" && <Catalog onChanged={loadMe} />}
          {tab === "mine" && <MyServices />}
          {tab === "admin" && <Admin />}
          <Nav current={tab} setCurrent={setTab} />
        </>
      )}
    </>
  );
}
