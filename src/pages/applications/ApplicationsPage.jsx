import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import AdminApplicationDetailModal from "../../components/applications/AdminApplicationDetailModal";
import { fetchApplications } from "../../services/adminApi";
import { formatDate } from "../../lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

function statusLabel(s) {
  if (!s) return "—";
  return String(s).replace(/_/g, " ");
}

export default function ApplicationsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailId, setDetailId] = useState(null);

  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchApplications({
          page,
          limit,
          search: debounced || undefined,
          status: status || undefined,
        });
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Failed to load applications.");
          return;
        }
        setItems(data.items || []);
        setTotal(data.total ?? 0);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debounced, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Job applications across employers — status, candidate, and job context."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search candidate name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-slate-500 pb-2">
            {total} application{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Card>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-4">Applied</th>
                    <th className="pb-3 pr-4">Candidate</th>
                    <th className="pb-3 pr-4">Employer</th>
                    <th className="pb-3 pr-4">Job</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3"> </th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 whitespace-nowrap">{formatDate(row.appliedAt)}</td>
                        <td className="py-3 pr-4">
                          {row.applicant?.id ? (
                            <Link
                              to={`/job-seekers/${row.applicant.id}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {row.applicant.name || "—"}
                            </Link>
                          ) : (
                            <span className="font-medium">{row.applicant?.name || "—"}</span>
                          )}
                          <p className="text-xs text-slate-500">{row.applicant?.email}</p>
                        </td>
                        <td className="py-3 pr-4 max-w-[200px]">
                          {row.employer?.id ? (
                            <Link
                              to={`/employers/${row.employer.id}`}
                              className="font-medium text-blue-600 hover:underline line-clamp-2"
                            >
                              {row.employer.label}
                            </Link>
                          ) : (
                            <span className="line-clamp-2">{row.employer?.label || "—"}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 max-w-[220px]">
                          <span className="line-clamp-2">{row.job?.title || "—"}</span>
                          <p className="text-xs text-slate-500">{row.job?.city || ""}</p>
                        </td>
                        <td className="py-3 pr-4 capitalize">{statusLabel(row.status)}</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => setDetailId(row.id)}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
                <p className="text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>

      <AdminApplicationDetailModal applicationId={detailId} open={detailId != null} onClose={() => setDetailId(null)} />
    </div>
  );
}
