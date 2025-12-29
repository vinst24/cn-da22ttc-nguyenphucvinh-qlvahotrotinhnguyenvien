import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance.js";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import MonthlyEventsChart from "./MonthlyEventsChart";
import MonthlyVolunteersChart from "./MonthlyVolunteersChart";
import OrgStatsChart from "./OrgStatsChart";

export default function OrgStats() {
  /* ================= SIDEBAR MENU ================= */
  const menu = [
    {
      label: "Quản lý hoạt động",
      route: "/org/activities",
      icon: Calendar
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
    upcoming: 0,
    ongoing: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlyEvents, setMonthlyEvents] = useState([]);
  const [monthlyVolunteers, setMonthlyVolunteers] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  /* ================= DATA FETCH ================= */
  useEffect(function() {
    const fetchStats = async function() {
      try {
        const res = await axiosInstance.get("/organization/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats({
          totalEvents: 0,
          totalVolunteers: 0,
          ongoing: 0,
          completed: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  useEffect(function() {
    const fetchCharts = async function() {
      try {
        const ev = await axiosInstance.get(
          "/organization/stats/monthly-events"
        );
        const vol = await axiosInstance.get(
          "/organization/stats/monthly-volunteers"
        );

        setMonthlyEvents(ev.data.data);
        setMonthlyVolunteers(vol.data.data);
        setYear(ev.data.year);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCharts();
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
              <BarChart3 className="w-7 h-7" />
              Thống kê tổ chức
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng quan số liệu hoạt động của tổ chức
            </p>
          </header>

          {/* STATS GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Tổng hoạt động"
              value={loading ? "..." : stats.totalActivities}
              icon={Calendar}
              color="green"
            />

            <StatCard
              title="Tình nguyện viên"
              value={loading ? "..." : stats.totalVolunteers}
              icon={Users}
              color="blue"
            />

            <StatCard
              title="Đang diễn ra"
              value={loading ? "..." : stats.ongoing}
              icon={Activity}
              color="yellow"
            />

            <StatCard
              title="Hoàn thành"
              value={loading ? "..." : stats.completed}
              icon={CheckCircle}
              color="gray"
            />
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrgStatsChart
              upcoming={stats.upcoming}
              ongoing={stats.ongoing}
              completed={stats.completed}
            />
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyEventsChart data={monthlyEvents} year={year} />
            <MonthlyVolunteersChart data={monthlyVolunteers} year={year} />
          </section>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function StatCard(props) {
  const Icon = props.icon;

  const colorMap = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-sm text-gray-500">
          {props.title}
        </p>

        <p className="text-3xl font-bold text-gray-800 mt-1">
          {props.value}
        </p>
      </div>

      <div
        className={
          "w-12 h-12 rounded-full flex items-center justify-center " +
          colorMap[props.color]
        }
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
