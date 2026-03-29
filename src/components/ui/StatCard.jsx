export default function StatCard({ label, value, hint, trend, trendUp, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {trend != null ? (
        <p
          className={`mt-3 text-sm font-medium ${trendUp ? "text-emerald-600" : "text-red-600"}`}
        >
          {trend}
        </p>
      ) : null}
    </div>
  );
}
