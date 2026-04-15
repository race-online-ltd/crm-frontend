import api from "./config/axiosInstance";

export async function login(payload) {
  const response = await api.post("/auth/login", payload, { skipAuthRedirect: true });
  return response.data?.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data?.message;
}

export async function me() {
  const response = await api.get("/auth/me");
  return response.data?.data?.user;
}

export async function getProfile() {
  const response = await api.get("/profile");
  return response.data?.data?.user;
}

export async function updateProfile(payload) {
  const response = await api.put("/profile", payload);
  return response.data?.data?.user;
}

export async function changePassword(payload) {
  const response = await api.put("/profile/change-password", payload);
  return response.data?.message;
}

export const AuthAPI = {
  login,
  logout,
  me,
  getProfile,
  updateProfile,
  changePassword,
};
