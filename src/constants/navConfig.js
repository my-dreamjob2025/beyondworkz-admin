/**
 * Sidebar navigation — matches BeyondWorkz admin IA from design mockups.
 * Icons resolved in AdminSidebar via lucide-react.
 */
export const NAV_SECTIONS = [
  {
    id: "dashboard",
    title: null,
    items: [{ to: "/", label: "Dashboard", icon: "LayoutDashboard", end: true }],
  },
  {
    id: "users",
    title: "User management",
    items: [
      { to: "/employers", label: "Employers", icon: "Building2" },
      { to: "/job-seekers", label: "Job Seekers", icon: "Users" },
    ],
  },
  {
    id: "jobs",
    title: "Jobs",
    items: [
      { to: "/jobs", label: "Jobs Management", icon: "Briefcase" },
      { to: "/candidates", label: "Candidates", icon: "UserSearch" },
      { to: "/applications", label: "Applications", icon: "FileStack" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      { to: "/credits-billing", label: "Credits & Billing", icon: "Wallet" },
      { to: "/payments", label: "Payments", icon: "CreditCard" },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    items: [
      { to: "/reports", label: "Reports & Analytics", icon: "BarChart3" },
      { to: "/referrals", label: "Referrals", icon: "Share2" },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      { to: "/support-tickets", label: "Support & Tickets", icon: "Headphones" },
      { to: "/notifications", label: "Notifications", icon: "Bell" },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { to: "/content", label: "Content Management", icon: "FileText" },
      { to: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
];
