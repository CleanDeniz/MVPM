import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { adminGet, adminPost, adminPatch } from "../api.js";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [ok, setOk] = useState(false);

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);

  async function ping() {
    const r = await adminGet("/api/admin/whoami", secret);
    setOk(!!r?.ok);
  }

  async function give() {
    const r = await adminPost("/api/admin/bonus", { phone, amount: Number(amount), reason: "manual" }, secret);
    alert(r.ok ? "Начислено" : r.error || "Ошибка");
  }

  async function addService() {
    const r = await adminPost("/api/admin/service", {
      title, partner, price: Number(price), description, visible: 1
    }, secret);
    alert(r.ok ? `Сохранено (id=${r.id})` : r.error || "Ошибка");
  }

  async function toggleVisibility(id, visible) {
    const r = await adminPatch(`/api/admin/service/${id}/visibility`, { visible }, secret);
    alert(r.ok ? "Ок" : r.error || "Ошибка");
  }

  async function loadUsers() {
    const r = await adminGet("/api/admin/users", secret);
    if (r.ok) setUsers(r.users);
  }

  useEffect(() => { if (ok) loadUsers(); }, [ok]);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-3">
      <Card>
        <div className="font-bold mb-2">Админ-доступ</div>
        {!ok ? (
          <div className="space-y-2">
            <input className="input" placeholder="ADMIN_SECRET" value={secret} onChange={e=>setSecret(e.target.value)} />
            <Button onClick={ping}>Войти</Button>
          </div>
        ) : (
          <div className="text-sm">Авторизовано</div>
        )}
      </Card>

      {ok && (
        <>
          <Card>
            <div className="font-bold mb-2">Начислить бонусы</div>
            <div className="space-y-2">
              <input className="input" placeholder="+79990000000" value={phone} onChange={e=>setPhone(e.target.value)} />
              <input className="input" type="number" placeholder="Сумма" value={amount} onChange={e=>setAmount(e.target.value)} />
              <Button onClick={give}>Начислить</Button>
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-2">Услуга (создать/обновить)</div>
            <div className="space-y-2">
              <input className="input" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />
              <input className="input" placeholder="Партнёр" value={partner} onChange={e=>setPartner(e.target.value)} />
              <input className="input" type="number" placeholder="Цена в бонусах" value={price} onChange={e=>setPrice(e.target.value)} />
              <textarea className="input" placeholder="Описание" value={description} onChange={e=>setDescription(e.target.value)} />
              <Button onClick={addService}>Сохранить</Button>
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-2">Пользователи</div>
            <div className="space-y-2">
              <Button onClick={loadUsers}>Обновить список</Button>
              <div className="space-y-2">
                {users.map(u=>(
                  <div key={u.id} className="border border-black rounded-xl p-2 text-sm">
                    <div className="font-bold">#{u.id} {u.first_name} {u.last_name} @{u.username}</div>
                    <div>Телефон: {u.phone || "—"}</div>
                    <div>Баланс: {u.balance}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
