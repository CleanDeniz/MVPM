import Card from "../components/Card.jsx";

export default function Balance({ me }) {
  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Ваш баланс</div>
            <div className="text-4xl font-black">{me?.balance ?? 0}</div>
          </div>
          <div className="text-right text-sm opacity-70">
            {me?.first_name} {me?.last_name}
            <div>@{me?.username}</div>
            <div className="opacity-60">{me?.phone || "Телефон не привязан"}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
