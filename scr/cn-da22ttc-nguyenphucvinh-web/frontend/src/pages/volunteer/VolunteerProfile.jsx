import axios from "axios";
import { CalendarCheck, LayoutDashboard, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import InputField from "../../components/InputField";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function VolunteerProfile() {
  const { auth, setAuth } = useAuth();
  const user = auth && auth.user;
  const token = auth && auth.accessToken;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
    countryId: "",
    address: ""
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user && user.avatar);

  /* ================= MENU ================= */
  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  /* ================= INIT ================= */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get("https://open.oapi.vn/location/countries");
        setCountries(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCountries();

    if (user && user.id) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "MALE",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        countryId: user.countryId || "",
        address: user.address || ""
      });
    }
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user || !user.id) return;

    try {
      setLoading(true);

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);

        const up = await api.post(`/volunteer/${user.id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        setAvatarPreview(up.data.volunteer.avatar);
      }

      const res = await api.put(`/volunteer/${user.id}`, form);
      const updatedUser = res.data.volunteer;

      setAuth(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      alert(
        err.response && err.response.data
          ? err.response.data.message
          : "Lỗi server"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= PASSWORD ================= */
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: ""
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = e =>
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleChangePassword = async e => {
    e.preventDefault();

    if (pwForm.newPassword !== pwForm.confirm) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setPwLoading(true);

      await axios.put(
        `http://localhost:5000/api/volunteer/${user.id}/change-password`,
        {
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword
        },
        { headers: { Authorization: "Bearer " + token } }
      );

      alert("Đổi mật khẩu thành công");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert(
        err.response && err.response.data
          ? err.response.data.message
          : "Lỗi khi đổi mật khẩu"
      );
    } finally {
      setPwLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="p-6 pt-24 flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            {/* PROFILE */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow p-6 space-y-4"
            >
              <header>
                <h2 className="text-2xl font-bold text-indigo-700">
                  Hồ sơ tình nguyện viên
                </h2>
                <p className="text-sm text-gray-500">
                  Cập nhật thông tin cá nhân
                </p>
              </header>

              {/* AVATAR */}
              <div className="flex items-center gap-4">
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="avatar"
                  className="w-20 h-20 rounded-full border"
                />
                <div>
                  <label className="block text-sm mb-1">Ảnh đại diện</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      setAvatarFile(e.target.files[0]);
                      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                  />
                </div>
              </div>

              <InputField
                label="Họ và tên"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />

              <InputField
                label="Email"
                name="email"
                value={form.email}
                disabled
              />

              <InputField
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              {/* GENDER */}
              <div>
                <label className="block mb-1">Giới tính</label>
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

              {/* COUNTRY */}
              <div>
                <label className="block mb-1">Quốc gia</label>
                <select
                  name="countryId"
                  value={form.countryId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Chọn quốc gia</option>
                  {countries.map(c =>
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  )}
                </select>
              </div>

              <InputField
                label="Địa chỉ"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg text-white font-semibold
                  ${loading
                    ? "bg-indigo-300"
                    : "bg-indigo-600 hover:bg-indigo-700"}
                `}
              >
                {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </form>

            {/* CHANGE PASSWORD */}
            <form
              onSubmit={handleChangePassword}
              className="bg-white rounded-xl shadow p-6 space-y-4"
            >
              <header>
                <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-500">
                  Bảo mật tài khoản của bạn
                </p>
              </header>

              <InputField
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
              />
              <InputField
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={handlePwChange}
              />
              <InputField
                label="Xác nhận mật khẩu"
                name="confirm"
                type="password"
                value={pwForm.confirm}
                onChange={handlePwChange}
              />

              <button
                type="submit"
                disabled={pwLoading}
                className={`px-5 py-2 rounded-lg text-white font-semibold
                  ${pwLoading
                    ? "bg-gray-300"
                    : "bg-green-600 hover:bg-green-700"}
                `}
              >
                {pwLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
