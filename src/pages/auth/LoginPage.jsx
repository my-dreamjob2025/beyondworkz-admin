import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Shield, ShieldCheck } from "lucide-react";
import brandLogo from "../../assets/logos/beyond-workz-logo.png";
import loginBg from "../../assets/login-bg.png";
import loginHero from "../../assets/login-hero.png";
import { BrandWordmark } from "../../components/brand/BrandMark";
import { useAuth } from "../../context/AuthContext";
import { sendAdminLoginOtp, verifyAdminOtp, resendAdminOtp } from "../../services/authService";

const primaryBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2D68FF] text-sm font-semibold text-white shadow-sm transition hover:bg-[#2557d6] disabled:opacity-60";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2D68FF] focus:outline-none focus:ring-2 focus:ring-[#2D68FF]/20";

export default function LoginPage() {
  const { user, initializing, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (initializing) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-900">
        <p className="text-sm text-white/70">Loading…</p>
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
      setOtp("");
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
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-[#1e4a8a]">
      <img
        src={loginBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2D68FF]/30 via-sky-400/10 to-blue-900/50"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left — branding + hero */}
        <aside className="flex shrink-0 flex-col px-5 pt-5 pb-3 sm:px-8 sm:pt-6 sm:pb-4 lg:h-full lg:min-h-0 lg:w-1/2 lg:max-w-[50%] lg:shrink-0 lg:px-10 lg:pt-8 lg:pb-8 xl:px-14">
          <div className="shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={brandLogo}
                alt=""
                className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-white/20 sm:h-9 sm:w-9"
              />
              <BrandWordmark variant="light" />
            </div>
            <h1 className="mt-3 max-w-lg text-2xl font-bold leading-tight tracking-tight text-white sm:mt-5 sm:text-3xl lg:mt-8 lg:text-4xl xl:text-[2.5rem] xl:leading-tight">
              BeyondWorkz Admin Panel
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/90 sm:mt-2 sm:text-base">
              Manage users, jobs, and platform operations in one place.
            </p>
          </div>
          <div className="mt-2 flex justify-center sm:mt-3 lg:mt-4 lg:min-h-0 lg:flex-1 lg:items-end lg:justify-center">
            <img
              src={loginHero}
              alt=""
              className="h-auto max-h-[28vh] w-full max-w-md object-contain object-bottom drop-shadow-2xl sm:max-h-[32vh] md:max-h-[34vh] lg:max-h-full lg:max-w-xl xl:max-w-2xl"
            />
          </div>
        </aside>

        {/* Right — login card (scrolls if needed, e.g. keyboard) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-5 pt-1 sm:px-6 sm:pb-6 lg:justify-center lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_24px_80px_-12px_rgba(15,23,42,0.25)] sm:p-8 lg:my-auto">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Login</h2>
            {step === "email" ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Sign in with your admin email — we’ll email you a one-time code.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Enter the code sent to {email}</p>
            )}

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                {info}
              </div>
            ) : null}

            {step === "email" ? (
              <form className="mt-6 space-y-5 sm:mt-8" onSubmit={handleSendOtp}>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="admin@beyondworkz.com"
                  />
                </div>
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      Send login code
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="mt-6 space-y-5 sm:mt-8" onSubmit={handleVerify}>
                <div>
                  <label htmlFor="email-readonly" className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    id="email-readonly"
                    type="email"
                    readOnly
                    value={email}
                    className="h-11 w-full cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3.5 text-sm text-slate-600"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="otp" className="text-sm font-medium text-slate-600">
                      One-time code
                    </label>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-sm font-medium text-[#2D68FF] hover:text-[#2557d6] disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="otp"
                      type={showOtp ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className={`${inputClass} py-2 pr-11 tracking-[0.2em]`}
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtp((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={showOtp ? "Hide code" : "Show code"}
                    >
                      {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading || otp.length < 6} className={primaryBtn}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & sign in"}
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
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    Check spam folder
                  </span>
                </div>
              </form>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5 sm:mt-8 sm:pt-6">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <p>This is a secure admin area. Unauthorized access is prohibited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
