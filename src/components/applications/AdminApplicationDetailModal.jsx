import { useEffect, useState } from "react";
import { fetchApplicationById } from "../../services/adminApi";
import { formatDate } from "../../lib/format";

const FLAG_LABELS = [
  ["experience", "We will review your experience against the role"],
  ["locationComfort", "Comfort working at this location matters"],
  ["immediateJoin", "Immediate availability is a plus"],
  ["salaryComfort", "Salary fit may be part of screening"],
];

export default function AdminApplicationDetailModal({ applicationId, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !applicationId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setPayload(null);
      try {
        const res = await fetchApplicationById(applicationId);
        if (cancelled) return;
        if (res.success && res.application) setPayload(res.application);
        else setError(res.message || "Could not load application.");
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Could not load application.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, applicationId]);

  if (!open) return null;

  const app = payload;
  const scr = app?.screening;
  const ack = scr?.acknowledgments || {};
  const customAnswers = Array.isArray(scr?.customAnswers) ? scr.customAnswers : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Application</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : app ? (
            <>
              <div className="text-xs text-slate-500">
                Applied {formatDate(app.appliedAt)} · Updated {formatDate(app.updatedAt)}
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Status</p>
                <p className="font-medium text-slate-900 capitalize">{String(app.status || "").replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Employer</p>
                <p className="font-medium text-slate-900">{app.employer?.label || "—"}</p>
                <p className="text-xs text-slate-500">{app.employer?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Candidate</p>
                <p className="font-medium text-slate-900">{app.applicant?.name || "—"}</p>
                <p className="text-slate-600">{app.applicant?.email}</p>
                {app.applicant?.phone ? <p className="text-slate-600">{app.applicant.phone}</p> : null}
                {app.applicant?.city ? <p className="text-slate-600">{app.applicant.city}</p> : null}
                {app.applicant?.experience ? (
                  <p className="text-xs text-slate-500 mt-1">Experience: {app.applicant.experience}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Job</p>
                <p className="font-medium text-slate-900">{app.job?.title || "—"}</p>
                <p className="text-slate-600">
                  {[app.job?.city, app.job?.area].filter(Boolean).join(", ") || "—"}
                </p>
              </div>

              {app.coverLetter?.trim() ? (
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500 mb-1">Cover letter</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{app.coverLetter}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No cover letter.</p>
              )}

              {FLAG_LABELS.some(([k]) => ack[k]) ? (
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500 mb-2">Screening confirmations</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {FLAG_LABELS.filter(([k]) => ack[k]).map(([key, label]) => (
                      <li key={key}>{label}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {customAnswers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase text-slate-500">Answers</p>
                  {customAnswers.map((row, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium text-slate-600">{row.question}</p>
                      <p className="text-slate-800 whitespace-pre-wrap mt-0.5">{row.answer || "—"}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
