import axios from "axios";
import jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, CalendarCheck, LayoutDashboard, Megaphone } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const token = auth && auth.accessToken;
  const user = auth && auth.user;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    availableEvents: [],
    registeredEvents: [],
    notifications: []
  });

  /* ================= SIDEBAR MENU ================= */
  const menu = [
    {
      label: "Hoạt động khả dụng",
      route: "/volunteer/available-events",
      icon: Megaphone
    },
    {
      label: "Hoạt động đã đăng ký",
      route: "/volunteer/registered-events",
      icon: CalendarCheck
    },
    {
      label: "Thông tin cá nhân",
      route: "/volunteer/profile",
      icon: LayoutDashboard
    }
  ];

  /* ================= VERIFY ================= */
  const verifyAccess = function() {
    if (!token || !user || user.role !== "MEMBER") {
      localStorage.clear();
      navigate("/login");
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        navigate("/login");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Token decode error:", err);
      localStorage.clear();
      navigate("/login");
      return false;
    }
  };

  /* ================= FETCH DATA ================= */
  useEffect(function() {
    if (!verifyAccess()) return;

    const fetchData = async function() {
      try {
        const headers = { Authorization: "Bearer " + token };

        const availableRes = await axios.get(
          "http://localhost:5000/api/volunteer/available",
          { headers }
        );
        const registeredRes = await axios.get(
          "http://localhost:5000/api/volunteer/" + user.id + "/events",
          { headers }
        );
        const notifyRes = await axios.get(
          "http://localhost:5000/api/volunteer/" + user.id + "/notifications",
          { headers }
        );

        setData({
          availableEvents: Array.isArray(availableRes.data.events)
            ? availableRes.data.events
            : [],
          registeredEvents: Array.isArray(registeredRes.data.events)
            ? registeredRes.data.events
            : [],
          notifications: Array.isArray(notifyRes.data.notifications)
            ? notifyRes.data.notifications
            : []
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="px-4 sm:px-6 pt-24 pb-10 space-y-10">
          {/* HEADER */}
          <header>
            <h1 className="text-3xl font-bold text-indigo-700">
              Chào mừng, {user && user.fullName ? user.fullName : "Volunteer"}
            </h1>
            <p className="text-gray-600 mt-1">
              Cảm ơn bạn đã đóng góp cho cộng đồng
            </p>
          </header>

          {/* STAT CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Hoạt động khả dụng"
              value={data.availableEvents.length}
              subtitle="Đang tuyển"
              icon={Megaphone}
              color="blue"
              onClick={() => navigate("/dashboard/available-events")}
            />
            <StatCard
              title="Hoạt động đã đăng ký"
              value={data.registeredEvents.length}
              subtitle="Sắp & đã tham gia"
              icon={CalendarCheck}
              color="green"
              onClick={() => navigate("/dashboard/registered-events")}
            />
            <StatCard
              title="Thông báo"
              value={data.notifications.length}
              subtitle="Chưa đọc"
              icon={Bell}
              color="yellow"
              onClick={() => navigate("/dashboard/profile")}
            />
          </section>

          {/* UPCOMING EVENTS */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Hoạt động sắp tới
            </h3>

            {data.registeredEvents.length === 0
              ? <p className="text-gray-400 italic">Chưa có hoạt động nào</p>
              : <ul className="divide-y">
                  {data.registeredEvents.map(event =>
                    <li
                      key={event.id}
                      className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded transition"
                    >
                      <span className="font-medium text-gray-700">
                        {event.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-"}{" "}
                        • {event.status}
                      </span>
                    </li>
                  )}
                </ul>}
          </section>

          {/* NOTIFICATIONS */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Thông báo mới
            </h3>
            {data.notifications.length === 0
              ? <p className="text-gray-400 italic">Không có thông báo nào</p>
              : <ul className="divide-y">
                  {data.notifications.map(note =>
                    <li
                      key={note.id}
                      className="py-2 text-gray-700 hover:bg-gray-50 px-2 rounded transition"
                    >
                      <span className="font-medium">
                        {note.title}
                      </span>
                      <p className="text-sm text-gray-500">
                        {note.content}
                      </p>
                    </li>
                  )}
                </ul>}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, subtitle, icon: Icon, color, onClick }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700"
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow p-6 cursor-pointer flex items-center justify-between hover:shadow-lg transition`}
    >
      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {value}
        </p>
        <p className="text-sm text-gray-400">
          {subtitle}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[
          color
        ]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
