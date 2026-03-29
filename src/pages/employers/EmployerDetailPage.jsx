import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import { fetchEmployerById } from "../../services/adminApi";
import { formatDate, fullName } from "../../lib/format";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function EmployerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchEmployerById(id);
        if (cancelled) return;
        if (!res.success || !res.employer) {
          setError(res.message || "Not found.");
          setData(null);
          return;
        }
        setData(res.employer);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cp = data?.companyProfile;
  const cd = cp?.companyDetails;
  const addr = cp?.address;
  const hire = cp?.hiringPreferences;
  const social = cp?.companySocialMedia;

  return (
    <div>
      <Link
        to="/employers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employers
      </Link>

      {error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading profile…
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{fullName(data.firstName, data.lastName)}</h1>
            <p className="mt-1 text-slate-500">{data.email}</p>
          </div>

          <Card className="space-y-6">
            <Section title="Account">
              <dl className="space-y-3">
                <Field label="Phone" value={data.phone} />
                <Field label="Job title" value={data.jobTitle} />
                <Field label="Department" value={data.department} />
                <Field label="Profile completion" value={`${data.profileCompletion ?? 0}%`} />
                <Field label="Email verified" value={data.isEmailVerified ? "Yes" : "No"} />
                <Field label="Blocked" value={data.isBlocked ? "Yes" : "No"} />
                <Field label="Joined" value={formatDate(data.createdAt)} />
              </dl>
            </Section>

            {cd || addr ? (
              <Section title="Company">
                <dl className="space-y-3">
                  <Field label="Company name" value={cd?.companyName} />
                  <Field label="Legal name" value={cd?.legalBusinessName} />
                  <Field label="Industry" value={cd?.industryType} />
                  <Field label="Type" value={cd?.companyType} />
                  <Field label="Size" value={cd?.companySize} />
                  <Field label="Founded" value={cd?.foundedYear} />
                  <Field label="HQ" value={cd?.headquarters} />
                  <Field label="Description" value={cd?.description} />
                  {addr ? (
                    <>
                      <Field
                        label="Address"
                        value={[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode, addr.country]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    </>
                  ) : null}
                  <Field label="Company verified" value={cp?.verified === true ? "Yes" : cp?.verified === false ? "No" : "—"} />
                </dl>
              </Section>
            ) : null}

            {hire && Object.values(hire).some((v) => v != null && v !== "") ? (
              <Section title="Hiring preferences">
                <dl className="space-y-3">
                  <Field label="Default location" value={hire.defaultJobLocation} />
                  <Field label="Employment type" value={hire.defaultEmploymentType} />
                  <Field label="Application email" value={hire.applicationEmail} />
                  <Field label="Response SLA" value={hire.responseSLA} />
                </dl>
              </Section>
            ) : null}

            {social && Object.values(social).some((v) => v && typeof v === "string") ? (
              <Section title="Web & social">
                <dl className="space-y-3">
                  <Field label="Website" value={social.website} />
                  <Field label="LinkedIn" value={social.linkedin} />
                  <Field label="Careers page" value={social.careersPage} />
                  <Field label="Glassdoor" value={social.glassdoor} />
                </dl>
              </Section>
            ) : null}

            {cp?.recruiters?.length ? (
              <Section title="Recruiters">
                <ul className="space-y-2">
                  {cp.recruiters.map((r, i) => (
                    <li key={i} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <span className="font-medium">
                        {r.firstName} {r.lastName}
                      </span>
                      {r.email ? <span className="ml-2 text-slate-500">{r.email}</span> : null}
                      {r.status ? (
                        <span className="ml-2 text-xs uppercase text-slate-400">{r.status}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
