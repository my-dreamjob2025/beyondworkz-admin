import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  UserSearch,
  FileStack,
  Wallet,
  CreditCard,
  BarChart3,
  Share2,
  Headphones,
  Bell,
  FileText,
  Settings,
} from "lucide-react";
import { NAV_SECTIONS } from "../../constants/navConfig";

const ICONS = {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  UserSearch,
  FileStack,
  Wallet,
  CreditCard,
  BarChart3,
  Share2,
  Headphones,
  Bell,
  FileText,
  Settings,
};

function NavIcon({ name, active }) {
  const Icon = ICONS[name] || LayoutDashboard;
  return (
    <Icon
      className={`h-5 w-5 shrink-0 ${active ? "text-blue-600" : "text-slate-500"}`}
      aria-hidden
    />
  );
}

export default function AdminSidebar({ onNavigate }) {
  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xl lg:max-w-none lg:shadow-none">
      <nav
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-3 pt-4 lg:pt-5"
        aria-label="Main"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className={section.title ? "mt-5 first:mt-0" : ""}>
            {section.title ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={handleClick}
                    className={({ isActive }) =>
                      [
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <NavIcon name={item.icon} active={isActive} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
