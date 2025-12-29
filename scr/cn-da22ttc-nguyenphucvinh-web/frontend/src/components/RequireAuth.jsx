import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { verifyToken } from "../api/authAPI.js";
import { useAuth } from "../context/useAuth.js";

export default function RequireAuth({ allowedRoles }) {
  const { auth, setAuth, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (auth && auth.accessToken) {
          setLoading(false);
          return;
        }

        const res = await verifyToken();

        setAuth({
          accessToken: res.accessToken,
          user: res.user
        });
      } catch (err) {
        console.error("Token verification failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Đang kiểm tra đăng nhập...</div>;
  }

  // ❌ Không đăng nhập
  if (!auth || !auth.accessToken) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Kiểm tra role
  if (allowedRoles) {
    if (!auth.user || !auth.user.role) {
      return <Navigate to="/unauthorized" replace />;
    }

    const userRole = auth.user.role.toUpperCase();
    const hasAccess = allowedRoles.some(
      role => role.toUpperCase() === userRole
    );

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
