import { Ban, Check, Mail, Phone, Shield, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

/* =======================
   MAIN COMPONENT
======================= */
export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(function() {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    try {
      const res = await axiosInstance.get("/admin/volunteers");
      setVolunteers(res.data && res.data.volunteers ? res.data.volunteers : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVolunteerDetail(id) {
    try {
      setDetailLoading(true);
      const res = await axiosInstance.get("/admin/volunteer/" + id);
      setSelected(res.data);
    } catch (error) {
      console.error(error);
      alert("Không thể tải chi tiết volunteer");
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleActive(id) {
    try {
      const res = await axiosInstance.put(
        "/admin/volunteer/" + id + "/toggle-active"
      );

      const updated = res.data;

      setVolunteers(function(prev) {
        return prev.map(function(v) {
          return v.id === updated.id ? { ...v, isActive: updated.isActive } : v;
        });
      });

      if (selected && selected.id === updated.id) {
        setSelected({ ...selected, isActive: updated.isActive });
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi đổi trạng thái");
    }
  }

  async function saveDetail() {
    try {
      await axiosInstance.put("/admin/volunteer/" + selected.id, {
        role: selected.role,
        isActive: selected.isActive
      });
      alert("Cập nhật thành công");
      fetchVolunteers();
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={[{ label: "Dashboard", route: "/admin/dashboard" }]} />

      <div className="flex-1 relative">
        <Topbar />

        <main className="px-4 sm:px-6 pt-24 pb-10">
          {/* HEADER */}
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-7 h-7 text-indigo-600" />
              Quản lý Volunteer
            </h2>
            <p className="text-gray-500 mt-1">
              Danh sách volunteer trong hệ thống
            </p>
          </header>

          {/* TABLE */}
          {loading
            ? <Loading />
            : <VolunteerTable
                data={volunteers}
                onSelect={fetchVolunteerDetail}
                onToggle={toggleActive}
              />}
        </main>

        {/* DETAIL PANEL */}
        {selected &&
          <VolunteerDetail
            data={selected}
            loading={detailLoading}
            onClose={() => setSelected(null)}
            onChange={setSelected}
            onSave={saveDetail}
          />}
      </div>
    </div>
  );
}

/* =======================
   TABLE
======================= */
function VolunteerTable({ data, onSelect, onToggle }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <Th>ID</Th>
            <Th>Tên</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th center>Active</Th>
          </tr>
        </thead>

        <tbody>
          {data.map(function(v) {
            return (
              <tr
                key={v.id}
                className="border-t hover:bg-gray-50 cursor-pointer transition"
                onClick={function() {
                  onSelect(v.id);
                }}
              >
                <Td mono>
                  #{v.id}
                </Td>
                <Td bold>
                  {v.fullName}
                </Td>
                <Td>
                  {v.email}
                </Td>
                <Td>
                  {v.role}
                </Td>

                <Td center>
                  <button
                    onClick={function(e) {
                      e.stopPropagation();
                      onToggle(v.id);
                    }}
                    className={
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white " +
                      (v.isActive
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700")
                    }
                  >
                    {v.isActive
                      ? <Check className="w-3 h-3" />
                      : <Ban className="w-3 h-3" />}
                    {v.isActive ? "Active" : "Inactive"}
                  </button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
   DETAIL PANEL
======================= */
function VolunteerDetail({ data, loading, onClose, onChange, onSave }) {
  return (
    <aside className="fixed top-0 right-0 w-full sm:w-[420px] h-full bg-white shadow-xl z-30 overflow-y-auto">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="font-semibold text-lg">Chi tiết Volunteer</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-red-600">
          <X />
        </button>
      </header>

      <div className="p-6 space-y-4 text-sm">
        {loading
          ? <div className="text-gray-500 italic">Đang tải...</div>
          : <div className="space-y-3">
              <DetailRow icon={User} label="Tên" value={data.fullName} />
              <DetailRow icon={Mail} label="Email" value={data.email} />
              <DetailRow icon={Phone} label="Phone" value={data.phone || "—"} />

              <DetailRow
                icon={Shield}
                label="Role"
                value={
                  <select
                    value={data.role}
                    onChange={function(e) {
                      onChange({ ...data, role: e.target.value });
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ORG">ORG</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                }
              />

              <div className="flex items-center gap-3">
                <span className="font-medium">Active</span>
                <input
                  type="checkbox"
                  checked={data.isActive}
                  onChange={function(e) {
                    onChange({ ...data, isActive: e.target.checked });
                  }}
                />
              </div>

              <button
                onClick={onSave}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
              >
                Lưu thay đổi
              </button>
            </div>}
      </div>
    </aside>
  );
}

/* =======================
   SMALL COMPONENTS
======================= */
function Th({ children, center }) {
  return (
    <th
      className={"p-3 font-medium text-left " + (center ? "text-center" : "")}
    >
      {children}
    </th>
  );
}

function Td({ children, mono, bold, center }) {
  return (
    <td
      className={
        "p-3 text-gray-700 " +
        (mono ? "font-mono " : "") +
        (bold ? "font-medium " : "") +
        (center ? "text-center" : "")
      }
    >
      {children}
    </td>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="font-medium">
        {label}:
      </span>
      <span>
        {value}
      </span>
    </div>
  );
}

function Loading() {
  return <div className="text-gray-500 italic">Đang tải dữ liệu...</div>;
}
