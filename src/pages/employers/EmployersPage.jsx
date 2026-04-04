import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Loader2, Search, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { deleteEmployer, fetchEmployers } from "../../services/adminApi";
import { formatDate, fullName } from "../../lib/format";

export default function EmployersPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchEmployers({ page, limit: 20, search: debounced || undefined });
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Failed to load employers.");
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
  }, [page, debounced]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  const performDelete = async () => {
    if (!confirmTarget) return;
    const rowId = confirmTarget.id;
    setDeletingId(rowId);
    setError("");
    try {
      const data = await deleteEmployer(rowId);
      if (!data.success) {
        setError(data.message || "Delete failed.");
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== rowId));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmTarget(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Employers"
        description="Manage employer accounts, verification, and company profiles."
        action={
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export data
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search email, name, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <p className="text-sm text-slate-500">
          {total} employer{total !== 1 ? "s" : ""}
        </p>
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
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-4">Contact</th>
                    <th className="pb-3 pr-4">Company</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Verified</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No employers found.
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <span className="font-medium text-slate-900">{fullName(row.firstName, row.lastName)}</span>
                          <div className="text-xs text-slate-500">{row.email}</div>
                        </td>
                        <td className="py-3 pr-4">{row.companyName || "—"}</td>
                        <td className="py-3 pr-4">
                          {row.isBlocked ? (
                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                              Blocked
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {row.companyVerified === true
                            ? "Yes"
                            : row.companyVerified === false
                              ? "No"
                              : "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-500">{formatDate(row.createdAt)}</td>
                        <td className="py-3 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              to={`/employers/${row.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View profile
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === row.id}
                              onClick={() =>
                                setConfirmTarget({
                                  id: row.id,
                                  nameLabel: fullName(row.firstName, row.lastName),
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingId === row.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete employer?"
        description={
          confirmTarget
            ? `Permanently delete employer “${confirmTarget.nameLabel}”? This removes their company profile, posted jobs, and related applications. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={performDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={!!confirmTarget && deletingId === confirmTarget.id}
      />
    </div>
  );
}
