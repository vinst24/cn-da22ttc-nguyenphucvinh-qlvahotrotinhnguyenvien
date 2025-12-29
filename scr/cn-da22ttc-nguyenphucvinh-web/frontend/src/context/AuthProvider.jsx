// AuthProvider.jsx
import { useEffect, useState } from "react";
import { logout as logoutApi, refreshToken as refreshTokenApi } from "../api/authAPI.js"; // Hàm gọi API để đăng xuất và refresh token
import api from "../api/axiosInstance.js"; // Axios instance để thiết lập header Authorization

import { AuthContext } from "./AuthContext"; // Import AuthContext để cung cấp state cho các component con

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
  });
  const [initialized, setInitialized] = useState(false);

  // Khi mount app, thử refresh token (backend dùng HTTP-only cookie)
  useEffect(() => {
    tryRefresh();
  }, []);

  const tryRefresh = async () => {
    try {
      const res = await refreshTokenApi(); // trả về axios response
      const data = res?.data;

      if (!data || !data.accessToken || !data.volunteer) {
        throw new Error("Invalid refresh response");
      }

      // Cập nhật trạng thái auth với user (volunteer) và accessToken mới
      setAuth({
        user: data.volunteer,
        accessToken: data.accessToken,
      });

      // Cập nhật header Authorization cho các request tiếp theo
      api.defaults.headers.common["Authorization"] = "Bearer " + data.accessToken;
    } catch (err) {
      console.error("Refresh token failed:", err);
      // Nếu refresh không thành công hoặc không có cookie, đảm bảo state đã được reset
      setAuth({ accessToken: null, user: null });
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setInitialized(true);
    }
  };

  // Logout: gọi BE xóa cookie và xóa state
  const logout = async () => {
    try {
      await logoutApi(); // Xóa refreshToken cookie từ backend
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Reset lại state và xóa Authorization header trong axios instance
      setAuth({ accessToken: null, user: null });
      delete api.defaults.headers.common["Authorization"];
      // Xóa bất kỳ token localStorage cũ (nếu có)
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } catch (e) {
        console.error("Failed to clear localStorage:", e);
      }
    }
  };

  // Thủ công refresh token khi cần (trả về accessToken)
  const handleRefresh = async () => {
    try {
      const res = await refreshTokenApi();
      const data = res?.data;
      if (data?.accessToken && data?.volunteer) {
        setAuth((prev) => ({
          ...prev,
          accessToken: data.accessToken,
          user: data.volunteer,
        }));

        api.defaults.headers.common["Authorization"] = "Bearer " + data.accessToken;
        return data.accessToken;
      }
    } catch (err) {
      console.error("Manual refresh failed:", err);
      return null;
    }
    return null;
  };

  if (!initialized) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, handleRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};
