import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import {
  fetchSupportTickets,
  fetchSupportTicketById,
  patchSupportTicketStatus,
  postSupportTicketReply,
} from "../../services/adminApi";
import { formatDate, fullName } from "../../lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_user", label: "Awaiting user" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PANEL_OPTIONS = [
  { value: "", label: "All panels" },
  { value: "employee", label: "Job seeker" },
  { value: "employer", label: "Employer" },
];

function statusLabel(s) {
  return String(s || "").replace(/_/g, " ");
}

export default function SupportTicketsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [panel, setPanel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const limit = 25;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, status, panel]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSupportTickets({
          page,
          limit,
          q: debounced || undefined,
          status: status || undefined,
          panel: panel || undefined,
        });
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Failed to load tickets.");
          return;
        }
        setItems(data.tickets || []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debounced, status, panel]);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const data = await fetchSupportTicketById(detailId);
        if (cancelled) return;
        if (data.success && data.ticket) setDetail(data.ticket);
        else setDetail(null);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailId]);

  const refreshList = async () => {
    const data = await fetchSupportTickets({
      page,
      limit,
      q: debounced || undefined,
      status: status || undefined,
      panel: panel || undefined,
    });
    if (data.success) {
      setItems(data.tickets || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    }
  };

  const handleStatusChange = async (next) => {
    if (!detail?.id || !next) return;
    setStatusSaving(true);
    try {
      const data = await patchSupportTicketStatus(detail.id, next);
      if (data.success && data.ticket) {
        setDetail(data.ticket);
        await refreshList();
      }
    } finally {
      setStatusSaving(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!detail?.id || !replyBody.trim()) return;
    setReplying(true);
    try {
      const data = await postSupportTicketReply(detail.id, replyBody.trim());
      if (data.success && data.ticket) {
        setDetail(data.ticket);
        setReplyBody("");
        await refreshList();
      }
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Support & tickets"
        description="Review tickets from job seekers and employers, update status, and reply from the team."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search ticket # or subject…"
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
              className="h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all-s"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            Panel
            <select
              value={panel}
              onChange={(e) => setPanel(e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
            >
              {PANEL_OPTIONS.map((o) => (
                <option key={o.value || "all-p"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-slate-500 pb-2">
            {total} ticket{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_minmax(0,420px)]">
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
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-3">Ticket</th>
                      <th className="pb-3 pr-3">User</th>
                      <th className="pb-3 pr-3">Panel</th>
                      <th className="pb-3 pr-3">Status</th>
                      <th className="pb-3 pr-3">Updated</th>
                      <th className="pb-3"> </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      items.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="py-3 pr-3">
                            <p className="font-mono text-xs text-slate-500">{row.ticketNumber}</p>
                            <p className="font-medium text-slate-900 line-clamp-2">{row.subject}</p>
                          </td>
                          <td className="py-3 pr-3 text-xs">
                            {row.user ? (
                              <>
                                <p>{fullName(row.user.firstName, row.user.lastName)}</p>
                                <p className="text-slate-500">{row.user.email}</p>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 pr-3 capitalize">{row.panel}</td>
                          <td className="py-3 pr-3 text-xs capitalize">{statusLabel(row.status)}</td>
                          <td className="py-3 pr-3 whitespace-nowrap text-xs">{formatDate(row.updatedAt)}</td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setDetailId(row.id);
                                setReplyBody("");
                              }}
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </Card>

        <Card className="min-h-[320px]">
          {!detailId ? (
            <p className="text-sm text-slate-500">Select a ticket from the table to view details and reply.</p>
          ) : detailLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading ticket…
            </div>
          ) : !detail ? (
            <p className="text-sm text-red-600">Could not load ticket.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-xs text-slate-500">{detail.ticketNumber}</p>
                <h2 className="text-lg font-semibold text-slate-900">{detail.subject}</h2>
                <p className="mt-1 text-xs text-slate-500 capitalize">
                  {detail.panel} · {detail.category?.replace(/_/g, " ")}
                </p>
                {detail.user ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {fullName(detail.user.firstName, detail.user.lastName)} · {detail.user.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Status</label>
                <select
                  value={detail.status}
                  disabled={statusSaving}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">Original message</p>
                <p className="mt-2 whitespace-pre-wrap text-slate-800">{detail.description}</p>
              </div>

              <div className="max-h-[240px] space-y-3 overflow-y-auto text-sm">
                {(detail.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg border p-3 ${
                      m.authorRole === "admin" ? "border-blue-100 bg-blue-50/80" : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-500 capitalize">
                      {m.authorRole === "admin" ? "Admin" : m.authorRole}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-800">{m.body}</p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-medium text-slate-500">Reply as support</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Your message to the user…"
                />
                <button
                  type="submit"
                  disabled={replying || !replyBody.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {replying ? "Sending…" : "Send reply"}
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
