import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function VolunteerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/volunteer/notifications");
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="p-6 pt-24 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6">

            <header className="mb-4">
              <h1 className="text-2xl font-bold text-indigo-700">
                Thông báo
              </h1>
              <p className="text-gray-500 text-sm">
                Cập nhật mới nhất dành cho bạn
              </p>
            </header>

            {loading ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-500 italic">
                Không có thông báo
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-4 rounded-lg border flex gap-3
                      ${n.read
                        ? "bg-gray-50"
                        : "bg-indigo-50 border-indigo-200"}
                    `}
                  >
                    <Bell className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {n.createdAt}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
