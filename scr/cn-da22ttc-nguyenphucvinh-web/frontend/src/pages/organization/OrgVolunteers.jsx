import { Mail, Phone, User, Users } from "lucide-react";
import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance.js";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function OrgVolunteers() {
  /* ================= SIDEBAR MENU ================= */
  const menu = [
    {
      label: "Quản lý hoạt động",
      route: "/org/activities",
      icon: Users
    },
    {
      label: "Danh sách tình nguyện viên",
      route: "/org/volunteers",
      icon: User
    },
    {
      label: "Thống kê tổ chức",
      route: "/org/stats",
      icon: Users
    }
  ];

  /* ================= STATE ================= */
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  useEffect(function() {
    const fetchVolunteers = async function() {
      try {
        const res = await axiosInstance.get("/organization/volunteers");
        setVolunteers(res.data.volunteers || []);
      } catch (err) {
        console.error("Failed to fetch volunteers:", err);
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50 min-h-screen">
        <Topbar />

        <main className="p-4 md:p-6 pt-24 space-y-6">
          {/* HEADER */}
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-green-700 flex items-center gap-2">
              <Users className="w-7 h-7" />
              Danh sách tình nguyện viên
            </h1>
            <p className="text-gray-600 mt-1">
              Tất cả tình nguyện viên tham gia tổ chức
            </p>
          </header>

          {/* LIST */}
          <section className="bg-white rounded-xl shadow divide-y">
            {loading &&
              <div className="p-6 text-gray-500 italic">
                Đang tải dữ liệu...
              </div>}

            {!loading &&
              volunteers.length === 0 &&
              <div className="p-6 text-gray-500 italic">
                Chưa có tình nguyện viên
              </div>}

            {!loading &&
              volunteers.map(function(v) {
                return <VolunteerRow key={v.id} volunteer={v} />;
              })}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function VolunteerRow({ volunteer }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
      {/* AVATAR */}
      <img
        src={volunteer.avatar || "https://i.pravatar.cc/40"}
        alt="avatar"
        className="w-10 h-10 rounded-full border object-cover"
      />

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {volunteer.fullName || volunteer.email || "-"}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {volunteer.email || "-"}
          </span>

          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {volunteer.phone || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
