import {
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardList,
  Handshake,
  Timer,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function OrgDashboard() {
  const navigate = useNavigate();

  /* ================= SIDEBAR MENU ================= */
  const menu = [
    {
      label: "Quản lý hoạt động",
      route: "/org/activities",
      icon: ClipboardList
    },
    {
      label: "Danh sách tình nguyện viên",
      route: "/org/volunteers",
      icon: Users
    },
    {
      label: "Thống kê tổ chức",
      route: "/org/stats",
      icon: BarChart3
    }
  ];

  /* ================= STATE ================= */
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalVolunteers: 0,
    ongoing: 0,
    completed: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/organization/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setStats({
          totalEvents: 0,
          totalVolunteers: 0,
          ongoing: 0,
          completed: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const res = await axiosInstance.get("/organization/recent-activities");
        setRecentActivities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setRecentActivities([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchStats();
    fetchRecentActivities();
  }, []);

  return (
    <div className="flex">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50 min-h-screen">
        <Topbar />

        <main className="p-4 md:p-6 pt-24 space-y-8">
          {/* HEADER */}
          <header>
            <h1 className="text-3xl font-bold text-green-700">
              Dashboard Tổ chức
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý hoạt động và tình nguyện viên của bạn
            </p>
          </header>

          {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Hoạt động"
              subtitle="Đã tạo"
              value={loadingStats ? "..." : stats.totalActivities}
              icon={Calendar}
              variant="green"
            />

            <StatCard
              title="Volunteer"
              subtitle="Đã đăng ký"
              value={loadingStats ? "..." : stats.totalVolunteers}
              icon={Handshake}
              variant="blue"
            />

            <StatCard
              title="Đang diễn ra"
              subtitle="Hoạt động"
              value={loadingStats ? "..." : stats.ongoing}
              icon={Timer}
              variant="yellow"
            />

            <StatCard
              title="Hoàn thành"
              subtitle="Hoạt động"
              value={loadingStats ? "..." : stats.completed}
              icon={CheckCircle}
              variant="gray"
            />
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Quản lý hoạt động"
              description="Tạo, chỉnh sửa và theo dõi hoạt động"
              icon={ClipboardList}
              onClick={() => navigate("/org/activities")}
              color="green"
            />

            <ActionCard
              title="Danh sách tình nguyện viên"
              description="Xem & quản lý người đăng ký"
              icon={Users}
              onClick={() => navigate("/org/volunteers")}
              color="blue"
            />

            <ActionCard
              title="Thống kê & báo cáo"
              description="Hiệu quả hoạt động của tổ chức"
              icon={BarChart3}
              onClick={() => navigate("/org/stats")}
              color="yellow"
            />
          </section>

          {/* RECENT ACTIVITIES */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Hoạt động gần đây
            </h3>

            {loadingRecent
              ? <div className="text-gray-400 italic">Đang tải dữ liệu...</div>
              : recentActivities.length === 0
                ? <div className="text-gray-400 italic">
                    Chưa có hoạt động nào
                  </div>
                : <ul className="divide-y">
                    {recentActivities.map(act =>
                      <li
                        key={act.id}
                        className="py-3 flex justify-between items-center"
                      >
                        <span className="font-medium">
                          {act.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {act.startDate
                            ? new Date(act.startDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "-"}{" "}
                          • {act.status}
                        </span>
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

function StatCard({ title, subtitle, value, icon: Icon, variant }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700"
  };

  const colorClass = colorMap[variant] || colorMap.gray;

  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">
          {value}
        </p>
        {subtitle &&
          <p className="text-sm text-gray-400 mt-1">
            {subtitle}
          </p>}
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, onClick, color }) {
  const borderMap = {
    green: "border-green-200 hover:border-green-400",
    blue: "border-blue-200 hover:border-blue-400",
    yellow: "border-yellow-200 hover:border-yellow-400"
  };

  const titleMap = {
    green: "text-green-700",
    blue: "text-blue-700",
    yellow: "text-yellow-700"
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow p-6 border cursor-pointer transition ${borderMap[
        color
      ]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-6 h-6 ${titleMap[color]}`} />
        <h3 className={`text-xl font-semibold ${titleMap[color]}`}>
          {title}
        </h3>
      </div>

      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
