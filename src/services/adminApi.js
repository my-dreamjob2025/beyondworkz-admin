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

export async function fetchJobSeekers(params = {}) {
  const { data } = await api.get("/admin/job-seekers", { params });
  return data;
}

export async function fetchJobSeekerById(id) {
  const { data } = await api.get(`/admin/job-seekers/${id}`);
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
