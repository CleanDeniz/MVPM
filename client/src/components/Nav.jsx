export default function Nav({ current, setCurrent }) {
  const items = [
    { k: "balance", t: "Баланс" },
    { k: "catalog", t: "Каталог" },
    { k: "mine", t: "Мои услуги" },
    { k: "admin", t: "Админ" }
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black">
      <div className="max-w-xl mx-auto grid grid-cols-4">
        {items.map(i => (
          <button key={i.k}
            className={`py-3 text-sm ${current===i.k?"font-bold underline":""}`}
            onClick={()=>setCurrent(i.k)}>
            {i.t}
          </button>
        ))}
      </div>
    </div>
  );
}
