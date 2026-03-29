import axios from "axios";
import api, {
  BASE_URL,
  PANEL,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
  clearTokens,
  getRefreshToken,
} from "./api";

export async function sendAdminLoginOtp(email) {
  const { data } = await api.post("/admin/auth/login", { email });
  return data;
}

export async function verifyAdminOtp(email, otp) {
  const { data } = await api.post("/admin/auth/verify-otp", { email, otp });
  return data;
}

export async function resendAdminOtp(email) {
  const { data } = await axios.post(`${BASE_URL}/auth/resend-otp`, {
    email,
    type: "admin_login",
  });
  return data;
}

export function persistSession({ accessToken, refreshToken, user }) {
  if (accessToken) setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
  if (user) setStoredUser(user);
}

export async function bootstrapSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
    panel: PANEL,
  });

  if (!data.success || !data.accessToken) {
    clearTokens();
    return null;
  }

  setAccessToken(data.accessToken);
  if (data.user) setStoredUser(data.user);
  return data.user;
}

export function logout() {
  clearTokens();
}
