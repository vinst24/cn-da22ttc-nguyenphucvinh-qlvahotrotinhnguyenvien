import axios from "axios";
import { HeartHandshake, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField.jsx";
import { register } from "../services/authService.js";

export default function Register() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
    gender: "MALE",
    dateOfBirth: "",
    countryId: "",
    address: ""
  });

  useEffect(function() {
    const fetchCountries = async function() {
      try {
        const res = await axios.get("https://open.oapi.vn/location/countries");

        if (res && res.data && res.data.data) {
          setCountries(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy quốc gia", err);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = function(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async function(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.repeatPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (!form.countryId) {
      setError("Vui lòng chọn quốc gia");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        countryId: parseInt(form.countryId, 10),
        address: form.address,
        role: "MEMBER"
      });

      navigate("/login");
    } catch (err) {
      let message = "Lỗi server";

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
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Trở thành tình nguyện viên
        </h1>
        <p className="text-center text-gray-500 text-sm mt-2 mb-6">
          Chung tay xây dựng cộng đồng nhân ái
        </p>

        {/* Error */}
        {error &&
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Họ và tên"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <InputField
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <InputField
              label="Nhập lại mật khẩu"
              name="repeatPassword"
              type="password"
              value={form.repeatPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <InputField
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Quốc gia</label>
            <select
              name="countryId"
              value={form.countryId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Chọn quốc gia</option>
              {countries.map(function(c) {
                return (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>

          <InputField
            label="Địa chỉ (tùy chọn)"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white
              bg-green-600 hover:bg-green-700 transition
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tình nguyện"}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-green-600 font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <HeartHandshake className="w-4 h-4" />
          <span>Vì một cộng đồng tốt đẹp hơn</span>
        </div>
      </div>
    </div>
  );
}
