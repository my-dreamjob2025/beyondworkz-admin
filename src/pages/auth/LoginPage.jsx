import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import brandLogo from "../../assets/logos/beyond-workz-logo.png";
import { BrandWordmark } from "../../components/brand/BrandMark";
import { useAuth } from "../../context/AuthContext";
import { sendAdminLoginOtp, verifyAdminOtp, resendAdminOtp } from "../../services/authService";

export default function LoginPage() {
  const { user, initializing, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await sendAdminLoginOtp(email.trim());
      if (!data.success) {
        setError(data.message || "Could not send OTP.");
        return;
      }
      setInfo(data.message || "Check your email for the code.");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyAdminOtp(email.trim(), otp.trim());
      if (!data.success || !data.accessToken) {
        setError(data.message || "Verification failed.");
        return;
      }
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await resendAdminOtp(email.trim());
      if (!data.success) {
        setError(data.message || "Could not resend.");
        return;
      }
      setInfo(data.message || "A new code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Resend failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <img
              src={brandLogo}
              alt=""
              className="h-16 w-auto max-w-[140px] object-contain sm:h-20 sm:max-w-[160px]"
            />
            <BrandWordmark variant="auth" className="text-center sm:text-left" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="mt-2 text-sm text-slate-500">
            {step === "email" ? "Sign in with your admin email — we’ll email you a one-time code." : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
        ) : null}
        {info ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {info}
          </div>
        ) : null}

        {step === "email" ? (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="admin@yourcompany.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Send login code
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                6-digit code
              </label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-center text-lg font-mono tracking-[0.3em] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify & sign in
            </button>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Admin access only. Run <code className="rounded bg-slate-100 px-1">npm run seed:admin</code> in the backend to
          create an admin user.
        </p>
      </div>
    </div>
  );
}
