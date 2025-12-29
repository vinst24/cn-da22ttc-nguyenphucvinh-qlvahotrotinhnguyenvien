import { Eye, EyeOff, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import OrganizationForm from "./OrganizationForm";

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    repeatPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  // Lấy danh sách quốc gia
  useEffect(() => {
    fetchCountries();
  }, []);
  async function fetchCountries() {
    try {
      const res = await api.get("/countries");
      const list = res.data && res.data.countries ? res.data.countries : [];
      setCountries(list);
      if (list.length > 0) setSelectedCountryId(list[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  // Lấy chi tiết tổ chức
  useEffect(
    () => {
      fetchOrganization();
    },
    [id]
  );
  async function fetchOrganization() {
    try {
      const res = await api.get("/admin/organization/" + id);
      if (res.data) {
        setOrg(res.data);
        setAccounts(res.data.accounts || []);
        if (res.data.countryId) setSelectedCountryId(res.data.countryId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Sửa thông tin tổ chức
  async function handleEditOrganization(updatedOrg) {
    setOrg(updatedOrg); // cập nhật state ngay
    alert("Cập nhật tổ chức thành công");
  }

  // Thêm tài khoản mới
  async function handleAddAccount() {
    if (
      !newAccount.email ||
      !newAccount.password ||
      !newAccount.repeatPassword ||
      !selectedCountryId
    ) {
      alert("Vui lòng điền đầy đủ thông tin, bao gồm quốc gia");
      return;
    }
    if (newAccount.password !== newAccount.repeatPassword) {
      alert("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      const res = await api.post(`/admin/organization/${id}/accounts`, {
        email: newAccount.email,
        password: newAccount.password,
        countryId: selectedCountryId
      });
      if (res.data) {
        setAccounts(accounts.concat(res.data));
        setNewAccount({ email: "", password: "", repeatPassword: "" });
        setShowPassword(false);
        setShowRepeatPassword(false);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm tài khoản");
    }
  }

  // Toggle trạng thái account
  async function toggleAccountActive(accountId) {
    try {
      const res = await api.put(`/admin/account/${accountId}/toggle-active`);
      setAccounts(
        accounts.map(
          acc =>
            acc.id === accountId ? { ...acc, isActive: res.data.isActive } : acc
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div>Đang tải...</div>;
  if (!org) return <div>Tổ chức không tồn tại</div>;

  return (
    <div className="flex h-screen">
      <Sidebar open={false} onClose={() => {}} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 mt-16 overflow-auto">
          <OrganizationForm
            initialData={{
              id: org.id,
              name: org.name,
              type: org.type,
              countryId: selectedCountryId
            }}
            countries={countries}
            onSuccess={handleEditOrganization}
            onCancel={() => {}}
          />

          {/* Quản lý tài khoản */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Tài khoản quản lý
            </h3>

            <table className="min-w-full text-sm mb-4">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc =>
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {acc.email}
                    </td>
                    <td className="px-3 py-2">
                      {acc.isActive ? "Hoạt động" : "Đã khóa"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        onClick={() => toggleAccountActive(acc.id)}
                      >
                        {acc.isActive ? "Khóa" : "Mở khóa"}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Thêm tài khoản */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="email"
                placeholder="Email"
                value={newAccount.email}
                onChange={e =>
                  setNewAccount({ ...newAccount, email: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={newAccount.password}
                  onChange={e =>
                    setNewAccount({ ...newAccount, password: e.target.value })}
                  className="border rounded px-3 py-2 w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={newAccount.repeatPassword}
                  onChange={e =>
                    setNewAccount({
                      ...newAccount,
                      repeatPassword: e.target.value
                    })}
                  className="border rounded px-3 py-2 w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-gray-500"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                >
                  {showRepeatPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <select
                value={selectedCountryId || ""}
                onChange={e => setSelectedCountryId(Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
              >
                {countries.map(c =>
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                )}
              </select>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded col-span-1"
                onClick={handleAddAccount}
              >
                Thêm tài khoản
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
