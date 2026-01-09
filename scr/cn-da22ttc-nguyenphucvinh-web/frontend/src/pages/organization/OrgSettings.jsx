import {
  Building2,
  Globe,
  Image as ImageIcon,
  MapPin,
  Phone,
  Save
} from "lucide-react";
import { useState } from "react";

import api from "../../api/axiosInstance";
import InputField from "../../components/InputField";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function OrgSettings() {
  const { auth, setAuth } = useAuth();
  const user = auth && auth.user ? auth.user : {};

  const [form, setForm] = useState({
    name: user.fullName || "",
    contact: user.phone || "",
    address: user.address || "",
    website: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [loading, setLoading] = useState(false);

  /* ================= SIDEBAR MENU ================= */
  const menu = [
    { label: "Dashboard", route: "/org/dashboard", icon: Building2 },
    { label: "Cài đặt", route: "/org/settings", icon: Save }
  ];

  const handleChange = function(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async function(e) {
    e.preventDefault();

    try {
      setLoading(true);

      /* ===== Upload avatar (user account) ===== */
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post("/volunteer/" + user.id + "/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      /* ===== Update contact info ===== */
      const res = await api.put("/volunteer/" + user.id, {
        phone: form.contact,
        address: form.address
      });

      const updated =
        res.data && res.data.volunteer ? res.data.volunteer : user;

      setAuth(function(prev) {
        return { ...prev, user: updated };
      });

      alert("Cập nhật thành công");
    } catch (err) {
      console.error(err);
      alert(
        err && err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Lỗi cập nhật"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="p-4 md:p-6 pt-24 flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-white shadow rounded-xl p-6 space-y-6"
          >
            {/* HEADER */}
            <header>
              <h2 className="text-2xl font-bold text-indigo-700">
                Cài đặt tổ chức
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cập nhật thông tin liên hệ và hình ảnh đại diện
              </p>
            </header>

            {/* ORGANIZATION NAME */}
            <div>
              <InputField
                label="Tên tổ chức"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Tên tổ chức chỉ được thay đổi bởi Admin
              </p>
            </div>

            {/* AVATAR */}
            <div className="flex items-center gap-4">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full border object-cover"
              />

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-4 h-4" />
                  Avatar tài khoản
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={function(e) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }}
                />

                <p className="text-xs text-gray-500 mt-1">
                  Ảnh đại diện cho tài khoản tổ chức
                </p>
              </div>
            </div>

            {/* CONTACT */}
            <InputField
              label={
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Liên hệ (số điện thoại)
                </span>
              }
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />

            {/* ADDRESS */}
            <InputField
              label={
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Địa chỉ
                </span>
              }
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            {/* WEBSITE */}
            <InputField
              label={
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </span>
              }
              name="website"
              value={form.website}
              onChange={handleChange}
            />

            {/* TIPS */}
            <div className="text-sm text-gray-600 bg-indigo-50 rounded-lg p-4">
              <p className="font-medium mb-1">Gợi ý cho trang tổ chức:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Mô tả sứ mệnh và mục tiêu tổ chức</li>
                <li>Email, số điện thoại, địa chỉ rõ ràng</li>
                <li>Liên kết website & mạng xã hội</li>
                <li>Loại tổ chức (NGO, Company, School,...)</li>
              </ul>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-white transition
                ${loading
                  ? "bg-indigo-300"
                  : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              <Save className="w-5 h-5" />
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
