import { Building2, Eye, EyeOff, Save, X } from "lucide-react";
import { useState } from "react";

export default function AddOrganizationForm({
  orgData,
  setOrgData,
  onSubmit,
  onCancel
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleChange = function(field, value) {
    const updated = Object.assign({}, orgData);
    updated[field] = value;
    setOrgData(updated);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
        <Building2 className="w-5 h-5 text-green-600" /> Thêm / Cấp tài khoản tổ
        chức
      </h3>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tên tổ chức */}
        <input
          type="text"
          placeholder="Tên tổ chức"
          value={orgData.name ? orgData.name : ""}
          onChange={function(e) {
            handleChange("name", e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Loại tổ chức */}
        <select
          value={orgData.type ? orgData.type : ""}
          onChange={function(e) {
            handleChange("type", e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Chọn loại tổ chức</option>
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

        {/* Email */}
        <input
          type="email"
          placeholder="Email tổ chức"
          value={orgData.email ? orgData.email : ""}
          onChange={function(e) {
            handleChange("email", e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={orgData.password ? orgData.password : ""}
            onChange={function(e) {
              handleChange("password", e.target.value);
            }}
            className="border border-gray-300 rounded px-3 py-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            className="absolute right-2 top-2.5 text-gray-500"
            onClick={function() {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword
              ? <EyeOff className="w-5 h-5" />
              : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Repeat Password */}
        <div className="relative w-full">
          <input
            type={showRepeatPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            value={orgData.repeatPassword ? orgData.repeatPassword : ""}
            onChange={function(e) {
              handleChange("repeatPassword", e.target.value);
            }}
            className="border border-gray-300 rounded px-3 py-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            className="absolute right-2 top-2.5 text-gray-500"
            onClick={function() {
              setShowRepeatPassword(!showRepeatPassword);
            }}
          >
            {showRepeatPassword
              ? <EyeOff className="w-5 h-5" />
              : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
          onClick={onSubmit}
        >
          <Save className="w-4 h-4" /> Lưu
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg flex items-center gap-2 transition"
          onClick={onCancel}
        >
          <X className="w-4 h-4" /> Hủy
        </button>
      </div>
    </div>
  );
}
