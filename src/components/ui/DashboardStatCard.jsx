/** KPI tile — optional trend (omit when we do not have real period-over-period data). */
export default function DashboardStatCard({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  iconWrapClass = "bg-blue-50 text-blue-600",
  hint,
}) {
  const showTrend = trend != null && String(trend).trim() !== "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${iconWrapClass}`}
        >
          {Icon ? <Icon className="h-5 w-5" strokeWidth={2} /> : null}
        </div>
        {showTrend ? (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-xs font-semibold sm:text-sm ${trendUp ? "text-emerald-600" : "text-red-600"}`}
            >
              {trend}
            </span>
            <SparklineMini up={trendUp} />
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SparklineMini({ up }) {
  const d = up
    ? "M0,14 L8,12 L16,10 L24,8 L32,6 L40,4 L48,2"
    : "M0,4 L8,6 L16,8 L24,10 L32,12 L40,13 L48,14";
  return (
    <svg width="52" height="18" viewBox="0 0 52 18" className="text-current" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={up ? "text-emerald-500" : "text-red-400"}
      />
    </svg>
  );
}
