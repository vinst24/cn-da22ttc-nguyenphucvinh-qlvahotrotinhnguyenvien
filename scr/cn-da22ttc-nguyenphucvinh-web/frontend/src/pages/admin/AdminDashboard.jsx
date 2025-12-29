import {
  BarChart3,
  Building2,
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function AdminDashboard() {
  const menu = [
    {
      label: "Quản lý volunteer",
      route: "/admin/volunteers",
      icon: Users
    },
    {
      label: "Quản lý tổ chức",
      route: "/admin/organizations",
      icon: Building2
    },
    {
      label: "Quản lý hoạt động",
      route: "/admin/events",
      icon: Calendar
    },
    {
      label: "Thống kê toàn hệ thống",
      route: "/admin/statistics",
      icon: BarChart3
    }
  ];

  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    events: 0,
    pending: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [actionStats, setActionStats] = useState({
    totalUsers: 0,
    pendingEvents: 0,
    reports: 0
  });
  const [loadingActions, setLoadingActions] = useState(true);

  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // 🔹 Fetch Stats
  async function fetchStats() {
    try {
      const res = await axiosInstance.get("/admin/statistics");
      if (res.data) {
        setStats({
          volunteers: res.data.volunteers || 0,
          organizations: res.data.organizations || 0,
          events: res.data.events || 0,
          pending: res.data.pending || 0
        });
      }
    } catch (err) {
      console.error("Fetch stats failed:", err);
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchActionStats() {
    try {
      const res = await axiosInstance.get("/admin/action-stats");
      if (res.data) {
        setActionStats({
          totalUsers: res.data.totalUsers || 0,
          pendingEvents: res.data.pendingEvents || 0,
          reports: res.data.reports || 0
        });
      }
    } catch (err) {
      console.error("Fetch action stats failed:", err);
    } finally {
      setLoadingActions(false);
    }
  }

  async function fetchRecentEvents() {
    try {
      const res = await axiosInstance.get("/admin/recent-events");
      if (res.data) {
        setRecentEvents(
          res.data.map(ev => ({
            id: ev.id,
            name: ev.name || "—",
            date: ev.date || "—",
            status: ev.status || "—"
          }))
        );
      }
    } catch (err) {
      console.error("Fetch recent events failed:", err);
    } finally {
      setLoadingRecent(false);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchActionStats();
    fetchRecentEvents();

    // 🔄 Lắng nghe refresh từ Events page
    function handleRefresh() {
      fetchStats();
      fetchActionStats();
      fetchRecentEvents();
    }

    window.addEventListener("refreshAdminStats", handleRefresh);

    return () => window.removeEventListener("refreshAdminStats", handleRefresh);
  }, []);

  return (
    <div className="flex">
      <Sidebar items={menu} />

      <div className="flex-1 bg-gray-50 min-h-screen">
        <Topbar />

        <main className="px-4 sm:px-6 pt-24 pb-10 space-y-10">
          {/* HEADER */}
          <header>
            <h1 className="text-3xl font-bold text-indigo-700">
              Admin Control Panel
            </h1>
            <p className="text-gray-500 mt-1">
              Quản lý & giám sát toàn bộ hệ thống
            </p>
          </header>

          {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tình nguyện viên"
              value={loadingStats ? "..." : stats.volunteers}
              subtitle="Người dùng"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Tổ chức"
              value={loadingStats ? "..." : stats.organizations}
              subtitle="Đối tác"
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Hoạt động"
              value={loadingStats ? "..." : stats.events}
              subtitle="Tổng số"
              icon={Calendar}
              color="yellow"
            />
            <StatCard
              title="Chờ duyệt"
              value={loadingStats ? "..." : stats.pending}
              subtitle="Hoạt động"
              icon={Clock}
              color="red"
            />
          </section>

          {/* ACTIONS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Người dùng hệ thống"
              description={
                loadingActions
                  ? "Đang tải..."
                  : "Quản lý " + actionStats.totalUsers + " người dùng"
              }
              icon={ShieldCheck}
            />
            <ActionCard
              title="Kiểm duyệt hoạt động"
              description={
                loadingActions
                  ? "Đang tải..."
                  : "Có " + actionStats.pendingEvents + " hoạt động chờ duyệt"
              }
              icon={BarChart3}
            />
            <ActionCard
              title="Báo cáo & thống kê"
              description={
                loadingActions
                  ? "Đang tải..."
                  : "Có " + actionStats.reports + " báo cáo"
              }
              icon={FileText}
            />
          </section>

          {/* RECENT EVENTS */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Hoạt động gần đây
            </h3>

            {loadingRecent
              ? <p className="text-gray-400 italic">Đang tải dữ liệu...</p>
              : recentEvents.length === 0
                ? <p className="text-gray-400 italic">Không có hoạt động nào</p>
                : <ul className="divide-y">
                    {recentEvents.map(event =>
                      <li
                        key={event.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium text-gray-700">
                          {event.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {event.date} • {event.status}
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

/* ================= UI COMPONENTS ================= */

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
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

function ActionCard({ title, description, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-gray-600 text-sm">
        {description}
      </p>
    </div>
  );
}
