import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  ArrowRight,
  FileStack,
  BriefcaseBusiness,
  Shield,
  CreditCard,
  Headphones,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import DashboardStatCard from "../components/ui/DashboardStatCard";
import { fetchDashboardStats } from "../services/adminApi";

const quickActions = [
  { to: "/employers", label: "Employers", sub: "Registered employer accounts", icon: Building2 },
  { to: "/job-seekers", label: "Job seekers", sub: "Registered job seeker accounts", icon: Users },
  { to: "/payments", label: "Payments", sub: "No live payment feed yet", icon: CreditCard },
  { to: "/support-tickets", label: "Support", sub: "Tickets from job seekers & employers", icon: Headphones },
];

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "0";
  return Number(n).toLocaleString();
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchDashboardStats();
        if (cancelled) return;
        if (res.success && res.counts) {
          setData(res);
        } else {
          setError(res.message || "Could not load dashboard.");
          setData(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || "Could not load dashboard.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const c = data?.counts;
  const growth = useMemo(() => data?.growth || [], [data?.growth]);
  const recentActivity = data?.recentActivity || [];

  const maxGrowth = useMemo(() => {
    const vals = growth.flatMap((g) => [g.employers || 0, g.jobSeekers || 0]);
    return Math.max(1, ...vals);
  }, [growth]);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Dashboard"
        description="Live counts from the database — no sample KPIs or trends."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{a.label}</p>
                <p className="text-sm text-slate-500">{a.sub}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardStatCard
          label="Total users"
          value={loading ? "…" : formatNumber(c?.totalUsers)}
          icon={Users}
          iconWrapClass="bg-blue-50 text-blue-600"
          hint="All roles including admins"
        />
        <DashboardStatCard
          label="Employers"
          value={loading ? "…" : formatNumber(c?.employers)}
          icon={Building2}
          iconWrapClass="bg-orange-50 text-orange-600"
        />
        <DashboardStatCard
          label="Job seekers"
          value={loading ? "…" : formatNumber(c?.jobSeekers)}
          icon={Users}
          iconWrapClass="bg-indigo-50 text-indigo-600"
        />
        <DashboardStatCard
          label="Admins"
          value={loading ? "…" : formatNumber(c?.admins)}
          icon={Shield}
          iconWrapClass="bg-slate-100 text-slate-700"
        />
        <DashboardStatCard
          label="Published jobs"
          value={loading ? "…" : formatNumber(c?.publishedJobs)}
          icon={BriefcaseBusiness}
          iconWrapClass="bg-sky-50 text-sky-600"
          hint={`${formatNumber(c?.totalJobs ?? 0)} total postings (all statuses)`}
        />
        <DashboardStatCard
          label="Applications"
          value={loading ? "…" : formatNumber(c?.totalApplications)}
          icon={FileStack}
          iconWrapClass="bg-violet-50 text-violet-600"
        />
        <DashboardStatCard
          label="Interviews scheduled"
          value={loading ? "…" : formatNumber(c?.interviewsScheduled)}
          icon={Briefcase}
          iconWrapClass="bg-emerald-50 text-emerald-600"
          hint="Applications in interview_scheduled status"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
        <Card className="lg:col-span-3" padding>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">New sign-ups by month</h2>
            <p className="text-sm text-slate-500">
              Employer vs job seeker accounts created (UTC months, last 6 months)
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                Employers
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                Job seekers
              </span>
            </div>
          </div>
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading…</div>
          ) : growth.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data</div>
          ) : (
            <div className="flex h-48 items-end justify-between gap-1 px-1 sm:h-52">
              {growth.map((row) => (
                <div key={row.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-40 w-full max-w-[48px] items-end justify-center gap-1 sm:h-44">
                    <div
                      className="w-[42%] max-w-[18px] rounded-t bg-orange-500 transition-all"
                      style={{
                        height: `${Math.max(4, (row.employers / maxGrowth) * 100)}%`,
                        minHeight: row.employers > 0 ? "8px" : "2px",
                      }}
                      title={`Employers: ${row.employers}`}
                    />
                    <div
                      className="w-[42%] max-w-[18px] rounded-t bg-blue-600 transition-all"
                      style={{
                        height: `${Math.max(4, (row.jobSeekers / maxGrowth) * 100)}%`,
                        minHeight: row.jobSeekers > 0 ? "8px" : "2px",
                      }}
                      title={`Job seekers: ${row.jobSeekers}`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 sm:text-xs">{row.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" padding>
          <h2 className="text-lg font-semibold text-slate-900">Revenue &amp; credits</h2>
          <p className="mt-1 text-sm text-slate-500">
            Billing, credits, and revenue are not stored in the API yet. When you add payment records,
            charts can plug in here.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-600">
            No financial aggregates to show.
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Today (UTC)</h2>
          <p className="mt-1 text-sm text-slate-500">Counts reset at midnight UTC.</p>
          <ul className="mt-5 space-y-3">
            {[
              {
                label: "Jobs created",
                value: loading ? "…" : formatNumber(c?.jobsPostedToday),
                color: "bg-blue-100 text-blue-700",
              },
              {
                label: "Applications submitted",
                value: loading ? "…" : formatNumber(c?.applicationsToday),
                color: "bg-violet-100 text-violet-700",
              },
              {
                label: "Interviews scheduled (pipeline)",
                value: loading ? "…" : formatNumber(c?.interviewsScheduled),
                color: "bg-emerald-100 text-emerald-700",
              },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
                <span
                  className={`flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg text-sm font-bold ${row.color}`}
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            “Interviews scheduled” is the total in that status, not only those created today.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
          <p className="mt-1 text-sm text-slate-500">Latest employers, job seekers, and job posts</p>
          <ul className="mt-5 space-y-4">
            {loading ? (
              <li className="text-sm text-slate-500">Loading…</li>
            ) : recentActivity.length === 0 ? (
              <li className="text-sm text-slate-500">No recent events yet.</li>
            ) : (
              recentActivity.map((item, idx) => (
                <li
                  key={`${item.type}-${idx}-${item.at}`}
                  className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.sub}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(item.at)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Alerts</h2>
          <p className="mt-1 text-sm text-slate-500">Automated monitoring is not configured.</p>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            There are no live alert rules tied to payments, traffic, or moderation yet. This panel will
            stay empty until the backend exposes real alert events.
          </div>
        </Card>
      </div>
    </div>
  );
}
