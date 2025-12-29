import { Building2, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import AddOrganizationForm from "./AddOrganizationForm";

export default function Organizations() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [newOrg, setNewOrg] = useState({
    name: "",
    type: "NGO",
    email: "",
    password: "",
    repeatPassword: ""
  });

  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  // fetch countries
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

  // fetch organizations
  useEffect(() => {
    fetchOrganizations();
  }, []);
  async function fetchOrganizations() {
    try {
      const res = await api.get("/admin/organizations");
      const orgs =
        res.data && res.data.organizations ? res.data.organizations : [];
      setList(orgs);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  // handle add organization
  async function handleAddOrganization() {
    if (
      !newOrg.name ||
      !newOrg.type ||
      !newOrg.email ||
      !newOrg.password ||
      !newOrg.repeatPassword ||
      !selectedCountryId
    ) {
      alert("Vui lòng điền đầy đủ thông tin, bao gồm quốc gia");
      return;
    }
    if (newOrg.password !== newOrg.repeatPassword) {
      alert("Mật khẩu nhập lại không khớp");
      return;
    }
    try {
      const res = await api.post("/admin/organizations", {
        name: newOrg.name,
        type: newOrg.type,
        email: newOrg.email,
        password: newOrg.password,
        countryId: selectedCountryId
      });
      if (res.data && res.data.organization) {
        setList(list.concat(res.data.organization));
        setNewOrg({
          name: "",
          type: "NGO",
          email: "",
          password: "",
          repeatPassword: ""
        });
        setSelectedCountryId(countries.length > 0 ? countries[0].id : null);
        setAdding(false);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm tổ chức / cấp tài khoản");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={[{ label: "Dashboard", route: "/admin/dashboard" }]} />
      <div className="flex-1">
        <Topbar />
        <main className="px-6 pt-24 pb-10">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-indigo-600" /> Quản lý Tổ
                chức
              </h2>
              <p className="text-gray-500 mt-1">Danh sách tổ chức</p>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={() => setAdding(true)}
            >
              <Save className="w-4 h-4" /> Thêm
            </button>
          </header>

          {adding &&
            <AddOrganizationForm
              orgData={newOrg}
              setOrgData={setNewOrg}
              countries={countries}
              selectedCountryId={selectedCountryId}
              setSelectedCountryId={setSelectedCountryId}
              onSubmit={handleAddOrganization}
              onCancel={() => setAdding(false)}
            />}

          {loading
            ? <div className="text-gray-500 italic">Đang tải dữ liệu...</div>
            : <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <Th>ID</Th>
                      <Th>Tổ chức</Th>
                      <Th center>Thành viên</Th>
                      <Th>Loại</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {list.length === 0
                      ? <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-gray-500"
                          >
                            Không có tổ chức nào
                          </td>
                        </tr>
                      : list.map(org =>
                          <tr
                            key={org.id}
                            className="hover:bg-gray-50 cursor-pointer transition"
                            onClick={() =>
                              navigate("/admin/organization/" + org.id)}
                          >
                            <Td mono>
                              #{org.id}
                            </Td>
                            <Td>
                              {org.name}
                            </Td>
                            <Td center>
                              <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                                <Users className="w-4 h-4" />{" "}
                                {org.userCount !== undefined
                                  ? org.userCount
                                  : 0}
                              </span>
                            </Td>
                            <Td>
                              <TypeBadge type={org.type} />
                            </Td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>}
        </main>
      </div>
    </div>
  );
}

/* ---------------- SMALL UI ---------------- */
function Th({ children, center }) {
  return (
    <th className={"px-5 py-3 text-left " + (center ? "text-center" : "")}>
      {children}
    </th>
  );
}
function Td({ children, mono, center }) {
  return (
    <td
      className={
        "px-5 py-4 text-gray-700 " +
        (mono ? "font-mono " : "") +
        (center ? "text-center" : "")
      }
    >
      {children}
    </td>
  );
}
function TypeBadge({ type }) {
  const map = {
    GOVERNMENT: "bg-blue-50 text-blue-700",
    NGO: "bg-green-50 text-green-700",
    CHARITY: "bg-pink-50 text-pink-700",
    COMPANY: "bg-indigo-50 text-indigo-700",
    SCHOOL: "bg-yellow-50 text-yellow-700",
    UNIVERSITY: "bg-purple-50 text-purple-700",
    HOSPITAL: "bg-red-50 text-red-700",
    RELIGIOUS: "bg-orange-50 text-orange-700",
    COMMUNITY: "bg-teal-50 text-teal-700",
    ENVIRONMENTAL: "bg-lime-50 text-lime-700",
    OTHER: "bg-gray-100 text-gray-600"
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium " +
        (map[type] ? map[type] : map["OTHER"])
      }
    >
      <Building2 className="w-3.5 h-3.5" /> {type}
    </span>
  );
}
