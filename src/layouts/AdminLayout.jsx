import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const id = requestAnimationFrame(() => setSidebarOpen(false));
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-slate-50">
      {/* Full-width navbar (spans entire viewport, not only the column beside the sidebar) */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* Backdrop only over the content band below the header */}
        <div
          className={`absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!sidebarOpen}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`absolute bottom-0 left-0 top-0 z-50 flex min-h-0 w-[min(280px,85vw)] max-w-[280px] flex-col transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-60 lg:max-w-none lg:translate-x-0 xl:w-64 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <main className="relative z-0 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
