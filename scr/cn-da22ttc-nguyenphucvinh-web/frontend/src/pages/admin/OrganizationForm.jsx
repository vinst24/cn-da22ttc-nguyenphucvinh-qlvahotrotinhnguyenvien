import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

export default function OrganizationForm({ 
  initialData,       // { id?, name, type, email?, password?, repeatPassword?, countryId? }
  countries,         // danh sách quốc gia
  onSuccess,         // callback khi thêm/sửa thành công
  onCancel
}) {
  const [orgData, setOrgData] = useState(initialData || {
    name: "",
    type: "NGO",
    email: "",
    password: "",
    repeatPassword: "",
    countryId: countries && countries.length > 0 ? countries[0].id : null
  });

  // Cập nhật countryId khi initialData thay đổi
  useEffect(() => {
    if (initialData && initialData.countryId) {
      setOrgData({ ...orgData, countryId: initialData.countryId });
    }
  }, [initialData]);

  async function handleSubmit() {
    // Kiểm tra bắt buộc
    if (!orgData.name || !orgData.type || !orgData.countryId) {
      alert("Vui lòng điền đầy đủ thông tin, bao gồm quốc gia");
      return;
    }

    if (!orgData.id) { // Thêm mới
      if (!orgData.email || !orgData.password || !orgData.repeatPassword) {
        alert("Vui lòng điền đầy đủ thông tin tài khoản");
        return;
      }
      if (orgData.password !== orgData.repeatPassword) {
        alert("Mật khẩu nhập lại không khớp");
        return;
      }

      try {
        const res = await api.post("/admin/organizations", {
          name: orgData.name,
          type: orgData.type,
          email: orgData.email,
          password: orgData.password,
          countryId: orgData.countryId
        });
        if (res.data && res.data.organization) {
          onSuccess(res.data.organization);
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi thêm tổ chức / cấp tài khoản");
      }
    } else { // Edit
      try {
        const res = await api.put("/admin/organization/" + orgData.id, {
          name: orgData.name,
          type: orgData.type,
          countryId: orgData.countryId
        });
        onSuccess(res.data);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi cập nhật tổ chức");
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {orgData.id ? "Sửa tổ chức" : "Thêm tổ chức / Cấp tài khoản"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tên tổ chức"
          value={orgData.name}
          onChange={e => setOrgData({ ...orgData, name: e.target.value })}
          className="border rounded px-3 py-2 w-full"
        />

        <select
          value={orgData.type}
          onChange={e => setOrgData({ ...orgData, type: e.target.value })}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="GOVERNMENT">Government</option>
          <option value="NGO">NGO</option>
          <option value="CHARITY">Charity</option>
          <option value="COMPANY">Company</option>
          <option value="SCHOOL">School</option>
          <option value="UNIVERSITY">University</option>
          <option value="HOSPITAL">Hospital</option>
          <option value="RELIGIOUS">Religious</option>
          <option value="COMMUNITY">Community</option>
          <option value="ENVIRONMENTAL">Environmental</option>
          <option value="OTHER">Other</option>
        </select>

        {/* Nếu thêm mới, hiển thị email + password */}
        {!orgData.id && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={orgData.email}
              onChange={e => setOrgData({ ...orgData, email: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={orgData.password}
              onChange={e => setOrgData({ ...orgData, password: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={orgData.repeatPassword}
              onChange={e => setOrgData({ ...orgData, repeatPassword: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </>
        )}

        {/* Dropdown chọn quốc gia */}
        <select
          value={orgData.countryId || ""}
          onChange={e => setOrgData({ ...orgData, countryId: Number(e.target.value) })}
          className="border rounded px-3 py-2 w-full"
        >
          {countries.map(function(c) {
            return (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={handleSubmit}
        >
          <Save className="w-4 h-4" /> {orgData.id ? "Lưu" : "Thêm"}
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
