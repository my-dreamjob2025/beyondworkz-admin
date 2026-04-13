import api from "./api";

export async function fetchDashboardStats() {
  const { data } = await api.get("/admin/dashboard-stats");
  return data;
}

export async function fetchEmployers(params = {}) {
  const { data } = await api.get("/admin/employers", { params });
  return data;
}

export async function fetchEmployerById(id) {
  const { data } = await api.get(`/admin/employers/${id}`);
  return data;
}

export async function deleteEmployer(id) {
  const { data } = await api.delete(`/admin/employers/${id}`);
  return data;
}

export async function patchEmployerVerification(id, body) {
  const { data } = await api.patch(`/admin/employers/${id}/verification`, body);
  return data;
}

export async function fetchJobSeekers(params = {}) {
  const { data } = await api.get("/admin/job-seekers", { params });
  return data;
}

export async function fetchJobSeekerById(id) {
  const { data } = await api.get(`/admin/job-seekers/${id}`);
  return data;
}

export async function deleteJobSeeker(id) {
  const { data } = await api.delete(`/admin/job-seekers/${id}`);
  return data;
}

export async function fetchApplications(params = {}) {
  const { data } = await api.get("/admin/applications", { params });
  return data;
}

export async function fetchApplicationById(id) {
  const { data } = await api.get(`/admin/applications/${id}`);
  return data;
}

export async function fetchSupportTickets(params = {}) {
  const { data } = await api.get("/admin/support/tickets", { params });
  return data;
}

export async function fetchSupportTicketById(ticketId) {
  const { data } = await api.get(`/admin/support/tickets/${ticketId}`);
  return data;
}

export async function patchSupportTicketStatus(ticketId, status) {
  const { data } = await api.patch(`/admin/support/tickets/${ticketId}`, { status });
  return data;
}

export async function postSupportTicketReply(ticketId, body) {
  const { data } = await api.post(`/admin/support/tickets/${ticketId}/replies`, { body });
  return data;
}
