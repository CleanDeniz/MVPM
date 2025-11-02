export default function Button({ children, onClick, disabled, type="button" }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className="btn w-full disabled:opacity-50">
      {children}
    </button>
  );
}
