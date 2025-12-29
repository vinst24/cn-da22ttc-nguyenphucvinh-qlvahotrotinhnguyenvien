import axios from "axios";
import { CalendarCheck, LayoutDashboard, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function RegisteredEvents() {
  const { auth } = useAuth();
  const user = auth && auth.user;
  const token = auth && auth.accessToken;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  useEffect(function () {
    const fetchEvents = async function () {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/volunteer/" + user.id + "/events",
          { headers: { Authorization: "Bearer " + token } }
        );
        setEvents(res.data.events || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50">
        <Topbar />

        <main className="p-6 pt-24">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">
            Hoạt động đã đăng ký
          </h1>

          {loading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : events.length === 0 ? (
            <div className="text-gray-500 italic">
              Bạn chưa đăng ký hoạt động nào
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(function (e) {
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{e.title}</h3>
                      <p className="text-sm text-gray-500">
                        {e.startDate
                          ? new Date(e.startDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </p>
                    </div>

                    <CalendarCheck className="w-6 h-6 text-green-600" />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
