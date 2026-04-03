import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAuth from "../components/auth/RequireAuth";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import EmployersPage from "../pages/employers/EmployersPage";
import EmployerDetailPage from "../pages/employers/EmployerDetailPage";
import JobSeekersPage from "../pages/jobSeekers/JobSeekersPage";
import JobSeekerDetailPage from "../pages/jobSeekers/JobSeekerDetailPage";
import JobsManagementPage from "../pages/jobs/JobsManagementPage";
import CandidatesPage from "../pages/candidates/CandidatesPage";
import ApplicationsPage from "../pages/applications/ApplicationsPage";
import CreditsBillingPage from "../pages/finance/CreditsBillingPage";
import PaymentsPage from "../pages/finance/PaymentsPage";
import ReportsPage from "../pages/insights/ReportsPage";
import ReferralsPage from "../pages/insights/ReferralsPage";
import SupportTicketsPage from "../pages/support/SupportTicketsPage";
import NotificationsPage from "../pages/support/NotificationsPage";
import ContentManagementPage from "../pages/system/ContentManagementPage";
import SettingsPage from "../pages/system/SettingsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="employers" element={<EmployersPage />} />
        <Route path="employers/:id" element={<EmployerDetailPage />} />
        <Route path="job-seekers" element={<JobSeekersPage />} />
        <Route path="job-seekers/:id" element={<JobSeekerDetailPage />} />
        <Route path="jobs" element={<JobsManagementPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="credits-billing" element={<CreditsBillingPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="support-tickets" element={<SupportTicketsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="content" element={<ContentManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
