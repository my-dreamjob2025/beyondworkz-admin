export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${padding ? "p-4 sm:p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
