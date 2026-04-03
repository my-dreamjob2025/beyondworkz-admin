import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { BrandLogoWithWordmarkLink } from "../brand/BrandMark";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";

function SearchField({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        disabled
        title="Global search is not connected to the API yet."
        placeholder="Search not available yet"
        className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 py-2 pl-10 pr-3 text-sm text-slate-500 placeholder:text-slate-400"
      />
    </div>
  );
}

export default function AdminHeader({ onMenuClick }) {
  const { user, logout, initializing } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  const notificationsEnabled = Boolean(user) && !initializing;
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(notificationsEnabled);

  const initials = useMemo(() => {
    const a = (user?.firstName?.[0] || "").toUpperCase();
    const b = (user?.lastName?.[0] || "").toUpperCase();
    if (a || b) return `${a}${b}`;
    return (user?.email?.[0] || "A").toUpperCase();
  }, [user]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <BrandLogoWithWordmarkLink to="/" />

        {/* Centered search — desktop */}
        <div className="mx-4 hidden min-w-0 flex-1 justify-center lg:flex">
          <SearchField className="w-full max-w-xl" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((o) => !o)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
              ) : null}
            </button>
            {showNotifications ? (
              <div className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  {notifications.length > 0 ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-[#2563EB] hover:underline disabled:opacity-50"
                      disabled={unreadCount === 0}
                      onClick={() => markAllRead()}
                    >
                      Mark all as read
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">No alerts</span>
                  )}
                </div>
                <div className="max-h-[min(60vh,320px)] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-slate-500">
                      No notifications yet. New applications and system alerts will appear here in real time.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="flex w-full gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">{n.title}</p>
                          {n.message ? <p className="mt-1 text-xs text-slate-600 line-clamp-3">{n.message}</p> : null}
                          {n.timeLabel ? <p className="mt-1 text-xs text-slate-400">{n.timeLabel}</p> : null}
                        </div>
                        {n.unread ? (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden />
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1 hover:bg-slate-50 sm:pl-2 sm:pr-2"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold text-white">
                {initials.slice(0, 2)}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">System Admin</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 md:block" />
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile / tablet search */}
      <div className="border-t border-slate-100 px-3 pb-3 pt-0 sm:px-4 lg:hidden">
        <SearchField />
      </div>
    </header>
  );
}
