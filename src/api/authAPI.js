import api from "./axiosInstance";

export const AuthAPI = {
  login: (payload) => api.post("/login", payload),
  logout: () => api.post("/logout"),
  getCurrentUser: () => api.get("/user"),
};
