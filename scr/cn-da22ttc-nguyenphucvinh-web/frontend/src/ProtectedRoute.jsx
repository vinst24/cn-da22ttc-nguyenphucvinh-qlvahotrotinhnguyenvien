import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosInstance from "./api/axiosInstance";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const res = await axiosInstance.get("/auth/me");
                if (isMounted) {
                    setIsAuthenticated(true);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setIsAuthenticated(false);
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []); // KHÔNG có dependency để tránh loop

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
};

export default ProtectedRoute;
