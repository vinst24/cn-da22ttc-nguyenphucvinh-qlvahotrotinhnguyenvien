import {
    Image as ImageIcon,
    Lock,
    Mail,
    ShieldCheck,
    User
} from "lucide-react";
import { useState } from "react";

import api from "../../api/axiosInstance";
import InputField from "../../components/InputField";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function AdminSettings() {
  const { auth, setAuth } = useAuth();
  const user = auth && auth.user ? auth.user : {};

  const [form, setForm] = useState({
    name: user.fullName ? user.fullName : "",
    email: user.email ? user.email : "",
    password: "",
    confirmPassword: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar ? user.avatar : ""
  );
  const [loading, setLoading] = useState(false);

  const menu = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Cài đặt tài khoản", route: "/admin/settings" }
  ];

  const handleChange = function(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async function(e) {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);

      // Upload avatar
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post("/volunteer/" + user.id + "/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      // Update profile
      const updateData = { fullName: form.name, email: form.email };
      if (form.password) updateData.password = form.password;

      const res = await api.put("/admin/volunteer/" + user.id, updateData);
      const updatedUser = res.data.admin ? res.data.admin : res.data;

      setAuth(prev => ({ ...prev, user: updatedUser }));

      alert("Cập nhật thành công");
    } catch (err) {
      console.error(err);
      alert(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Lỗi server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={menu} />
      <div className="flex-1">
        <Topbar />

        <main className="px-4 sm:px-6 pt-24 pb-10 flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-8"
          >
            {/* HEADER */}
            <header className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Cài đặt Admin
                </h2>
                <p className="text-sm text-gray-500">
                  Quản lý thông tin & bảo mật tài khoản
                </p>
              </div>
            </header>

            {/* AVATAR */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={
                    avatarPreview ? avatarPreview : "/default-avatar.png"
                  }
                  alt="avatar"
                  className="w-28 h-28 rounded-full border object-cover shadow-sm transition-transform transform group-hover:scale-105"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-indigo-600 hover:underline">
                <ImageIcon className="w-4 h-4" />
                Đổi ảnh đại diện
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={function(e) {
                    const file = e.target.files[0];
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Họ và tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={<User size={18} />}
              />
              <InputField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                icon={<Mail size={18} />}
              />
              <InputField
                label="Mật khẩu mới"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                icon={<Lock size={18} />}
              />
              <InputField
                label="Xác nhận mật khẩu"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                icon={<Lock size={18} />}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
