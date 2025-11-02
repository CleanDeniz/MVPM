import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { apiGet, apiPost } from "../api.js";

export default function Catalog({ onChanged }) {
  const [list, setList] = useState([]);

  async function load() {
    const r = await apiGet("/api/services");
    if (r.ok) setList(r.services);
  }
  useEffect(() => { load(); }, []);

  async function buy(id) {
    const r = await apiPost(`/api/purchase/${id}`);
    if (!r.ok) {
      alert(r.error || "Ошибка");
    } else {
      onChanged?.();
      load();
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-3">
      {list.map(s => (
        <Card key={s.id}>
          <div className="flex justify-between gap-3">
            <div>
              <div className="font-bold">{s.title}</div>
              <div className="text-sm opacity-70">{s.partner}</div>
              <div className="text-sm mt-2">{s.description}</div>
            </div>
            <div className="text-right min-w-24">
              <div className="font-black text-xl">{s.price}</div>
              <div className="text-xs opacity-70 mb-2">бонусов</div>
              <Button onClick={() => buy(s.id)}>Купить</Button>
            </div>
          </div>
        </Card>
      ))}
      {list.length === 0 && <div className="opacity-60 text-center">Каталог пуст</div>}
    </div>
  );
}
