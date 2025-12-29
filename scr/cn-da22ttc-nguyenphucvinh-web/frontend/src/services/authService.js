import axiosInstance from "../api/axiosInstance.js";

// ==========================
// LOGIN
// ==========================
export const login = async ({ email, password }) => {
  // Basic client-side validation / normalization
  const e = (email || "").toString().trim();
  const p = (password || "").toString();

  if (!e || !p) {
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  const res = await axiosInstance.post("/auth/login", { email: e, password: p });

  return {
    token: res.data.accessToken,
    volunteer: res.data.volunteer
  };
};

// ==========================
// REGISTER
// ==========================
export const register = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

// export const register = async (data) => {
//   const res = await axios.post(`${API_URL}/register`, data);
//   return res.data;
// };

// ==========================
// REFRESH TOKEN
// ==========================
export const getNewAccessToken = async () => {
  // Use the same refresh endpoint as authAPI (backend expects POST to /auth/refresh)
  const res = await axiosInstance.post("/auth/refresh");
  return res.data.accessToken;
};
