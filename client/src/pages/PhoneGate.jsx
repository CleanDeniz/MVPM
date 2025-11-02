import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { apiPost } from "../api.js";

export default function PhoneGate({ onDone }) {
  async function requestPhone() {
    const tg = window.Telegram?.WebApp;
    if (!tg?.requestPhone) {
      alert("Телефон можно подтвердить только внутри Telegram Mini App.");
      return;
    }
    try {
      const resp = await tg.requestPhone();
      if (resp?.phone_number) {
        const r = await apiPost("/api/phone", { phone: resp.phone_number });
        if (r.ok) onDone();
      } else {
        alert("Номер не получен");
      }
    } catch (e) {
      alert("Отмена или ошибка запроса телефона");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <Card>
        <h1 className="text-xl font-bold mb-2">Подтвердите номер</h1>
        <p className="mb-4 text-sm">Мини-приложение запросит номер через Telegram.</p>
        <Button onClick={requestPhone}>Подтвердить телефон</Button>
      </Card>
    </div>
  );
}
