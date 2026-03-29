import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const REFRESH_TOKEN_KEY = "bw_admin_refresh_token";
const USER_KEY = "bw_admin_user";
const PANEL = "admin";

let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

export const clearAccessToken = () => {
  _accessToken = null;
};

export const setRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearTokens = () => {
  clearAccessToken();
  clearRefreshToken();
  setStoredUser(null);
};

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
      panel: PANEL,
    })
    .then(({ data }) => {
      if (data?.success && data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.user) setStoredUser(data.user);
        return data.accessToken;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/logout") &&
      !originalRequest.url?.includes("/admin/auth/")
    ) {
      originalRequest._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      }
      clearTokens();
    }

    return Promise.reject(error);
  }
);

export { BASE_URL, PANEL };
export default api;
