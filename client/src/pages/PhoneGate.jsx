import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { apiPost } from "../api.js";

export default function PhoneGate({ onDone }) {
  async function authorizeByTelegram() {
    const tg = window.Telegram?.WebApp;
    tg?.MainButton?.hide?.();

    try {
      const user = tg?.initDataUnsafe?.user;
      if (!user) {
        alert("Не удалось получить данные Telegram. Откройте мини-приложение в клиенте Telegram, а не в браузере.");
        return;
      }
      const r = await apiPost("/api/telegram-auth", {
        tg_id: user.id,
        name: user.first_name || "",
        username: user.username || ""
      });
      if (r?.ok) onDone?.();
      else alert("Ошибка авторизации: " + (r?.error || "UNKNOWN"));
    } catch (e) {
      console.error(e);
      alert("Ошибка авторизации через Telegram");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <Card>
        <h1 className="text-xl font-bold mb-2">Вход через Telegram</h1>
        <p className="mb-4 text-sm">
          Приложение использует данные вашего Telegram-профиля. Телефон не требуется.
        </p>
        <Button onClick={authorizeByTelegram}>Продолжить</Button>
      </Card>
    </div>
  );
}
