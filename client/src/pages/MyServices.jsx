import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { apiGet } from "../api.js";

export default function MyServices() {
  const [items, setItems] = useState([]);

  async function load() {
    const r = await apiGet("/api/my-services");
    if (r.ok) setItems(r.items);
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-3">
      {items.map(i => (
        <Card key={i.id}>
          <div className="font-bold">{i.title}</div>
          <div className="text-sm opacity-70">{i.partner}</div>
          <div className="text-sm mt-1">{i.description}</div>
          <div className="text-xs mt-2 opacity-60">Получено: {new Date(i.purchased_at).toLocaleString()}</div>
        </Card>
      ))}
      {items.length === 0 && <div className="opacity-60 text-center">Вы ещё ничего не приобрели</div>}
    </div>
  );
}
