import axios from "axios";
import { getNewAccessToken } from "../services/authService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không refresh cho login / refresh
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await getNewAccessToken();

        // set header mới
        axiosInstance.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;

        originalRequest.headers.Authorization =
          "Bearer " + newAccessToken;

        return axiosInstance(originalRequest);
      } catch (err) {
        // refresh fail → logout toàn cục
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
