import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import { fetchJobSeekerById } from "../../services/adminApi";
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
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900 break-words">{value ?? "—"}</dd>
    </div>
  );
}

export default function JobSeekerDetailPage() {
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
        const res = await fetchJobSeekerById(id);
        if (cancelled) return;
        if (!res.success || !res.jobSeeker) {
          setError(res.message || "Not found.");
          setData(null);
          return;
        }
        setData(res.jobSeeker);
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

  const p = data?.profile;
  const wc = p?.whiteCollarDetails;
  const bc = p?.blueCollarDetails;

  return (
    <div>
      <Link
        to="/job-seekers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job seekers
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
                <Field label="City" value={data.city} />
                <Field label="Employee type (auth)" value={data.employeeType} />
                <Field label="Work status" value={data.workStatus} />
                <Field label="Experience" value={`${data.years || "0"}y ${data.months || "0"}m`} />
                <Field label="Profile completion" value={`${data.profileCompletion ?? 0}%`} />
                <Field label="Email verified" value={data.isEmailVerified ? "Yes" : "No"} />
                <Field label="Phone verified" value={data.isPhoneVerified ? "Yes" : "No"} />
                <Field label="Blocked" value={data.isBlocked ? "Yes" : "No"} />
                <Field label="Joined" value={formatDate(data.createdAt)} />
              </dl>
            </Section>

            {p ? (
              <Section title="Profile">
                <dl className="space-y-3">
                  <Field label="Profile type" value={p.employeeType} />
                  <Field label="WhatsApp" value={p.whatsappNumber} />
                  <Field label="Location" value={p.location} />
                  <Field label="Availability" value={p.availability} />
                  {p.skills?.length ? (
                    <Field label="Skills" value={p.skills.map((s) => s.name).filter(Boolean).join(", ")} />
                  ) : null}
                </dl>
              </Section>
            ) : (
              <p className="text-sm text-slate-500">No extended profile document yet.</p>
            )}

            {wc && Object.keys(wc).length ? (
              <Section title="White-collar details">
                <dl className="space-y-3">
                  <Field label="Headline" value={wc.resumeHeadline} />
                  <Field label="Bio" value={wc.bio} />
                  <Field label="LinkedIn" value={wc.linkedin} />
                  <Field label="GitHub" value={wc.github} />
                  <Field label="Portfolio" value={wc.portfolio} />
                  <Field
                    label="Experience (totals)"
                    value={
                      wc.totalExperienceYears != null || wc.totalExperienceMonths != null
                        ? `${wc.totalExperienceYears ?? 0}y ${wc.totalExperienceMonths ?? 0}m`
                        : null
                    }
                  />
                  {wc.resume?.url ? <Field label="Resume URL" value={wc.resume.url} /> : null}
                </dl>
              </Section>
            ) : null}

            {bc && Object.keys(bc).length ? (
              <Section title="Blue-collar details">
                <dl className="space-y-3">
                  <Field label="Vehicle washing experience" value={bc.hasVehicleWashingExperience ? "Yes" : "No"} />
                  <Field label="Bike / scooty" value={bc.hasBikeOrScooty ? "Yes" : "No"} />
                  <Field label="Driving license" value={bc.hasDrivingLicense ? "Yes" : "No"} />
                  <Field label="License number" value={bc.drivingLicenseNumber} />
                  {bc.preferredAreas?.length ? (
                    <Field label="Preferred areas" value={bc.preferredAreas.join(", ")} />
                  ) : null}
                </dl>
              </Section>
            ) : null}

            {p?.experience?.length ? (
              <Section title="Experience">
                <ul className="space-y-3">
                  {p.experience.map((ex, i) => (
                    <li key={i} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <div className="font-medium">{ex.jobTitle}</div>
                      <div className="text-xs text-slate-500">
                        {ex.company}
                        {ex.dateOfJoining
                          ? ` · ${formatDate(ex.dateOfJoining)} – ${
                              ex.current ? "Present" : ex.relievingDate ? formatDate(ex.relievingDate) : "—"
                            }`
                          : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {p?.education?.length ? (
              <Section title="Education">
                <ul className="space-y-3">
                  {p.education.map((ed, i) => (
                    <li key={i} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <div className="font-medium">{[ed.level, ed.degree].filter(Boolean).join(" · ") || "Education"}</div>
                      <div className="text-xs text-slate-500">{ed.institution}</div>
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
