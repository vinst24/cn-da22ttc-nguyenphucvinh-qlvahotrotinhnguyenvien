import { HandHeart, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";
import InputField from "../components/InputField.jsx";
import { useAuth } from "../context/useAuth.js";
import { login } from "../services/authService.js";

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = function(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async function(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(form);

      if (!data || !data.token || !data.volunteer) {
        throw new Error("Đăng nhập thất bại");
      }

      setAuth({
        accessToken: data.token,
        user: data.volunteer
      });

      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer " + data.token;

      const role = data.volunteer.role ? data.volunteer.role : "MEMBER";

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "ORG") navigate("/org/dashboard");
      else navigate("/volunteer/dashboard");
    } catch (err) {
      let message = "Đăng nhập thất bại";

      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        message = err.response.data.message;
      } else if (err && err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <HandHeart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Đăng nhập
        </h1>
        <p className="text-center text-gray-500 text-sm mt-2 mb-6">
          Cùng chung tay lan tỏa giá trị tốt đẹp cho cộng đồng
        </p>

        {/* Error */}
        {error &&
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <InputField
            label="Mật khẩu"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white
              bg-green-600 hover:bg-green-700 transition
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-green-600 font-medium hover:underline"
          >
            Đăng ký tình nguyện viên
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <HandHeart className="w-4 h-4" />
          <span>Vì một cộng đồng tốt đẹp hơn</span>
        </div>
      </div>
    </div>
  );
}
