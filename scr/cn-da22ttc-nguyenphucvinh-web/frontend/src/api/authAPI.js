import api from "./axiosInstance.js";

// REGISTER
export const register = (data) => api.post("/auth/register", data);

// LOGIN
export const login = (data) => api.post("/auth/login", data);

// VERIFY ACCESS TOKEN
export const verifyToken = () => api.get("/auth/verify-token");

// REFRESH TOKEN
// Backend sẽ lấy refreshToken từ HTTP-only cookie
export const refreshToken = () => api.post("/auth/refresh");

// LOGOUT
// Backend sẽ xóa refreshToken cookie
export const logout = () => api.post("/auth/logout");
