import { Link } from "react-router-dom";
import brandLogo from "../../assets/logos/beyond-workz-logo.png";

const fontStack = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };

export function BrandWordmark({ variant = "header", className = "" }) {
  const sizes = {
    header: "text-[0.8125rem] font-bold leading-none min-[400px]:text-[0.9375rem] sm:text-lg sm:font-extrabold sm:leading-tight",
    auth: "text-2xl font-extrabold leading-tight sm:text-3xl",
    light: "text-lg font-bold leading-tight sm:text-xl",
  };
  const isLight = variant === "light";
  return (
    <span
      className={`tracking-tight whitespace-nowrap ${sizes[variant] || sizes.header} ${className}`}
      style={fontStack}
    >
      <span className={isLight ? "text-white" : "text-slate-900"}>Beyond</span>{" "}
      <span className={isLight ? "text-white/95" : "text-blue-600"}>Workz</span>
    </span>
  );
}

export function BrandLogoWithWordmarkLink({ to = "/", imgClassName, variant = "header", className = "" }) {
  return (
    <Link
      to={to}
      className={`flex min-w-0 shrink-0 items-center gap-1.5 rounded-lg py-0.5 transition hover:opacity-90 min-[400px]:gap-2 sm:gap-2.5 ${className}`}
    >
      <img
        src={brandLogo}
        alt=""
        className={
          imgClassName ||
          "h-9 w-auto max-h-10 shrink-0 object-contain object-left sm:h-10"
        }
      />
      <BrandWordmark variant={variant} />
    </Link>
  );
}
