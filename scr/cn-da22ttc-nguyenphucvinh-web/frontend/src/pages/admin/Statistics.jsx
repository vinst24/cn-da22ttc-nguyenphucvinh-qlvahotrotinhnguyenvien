// pages/admin/Statistics.jsx
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import { Building2, Calendar, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    events: 0,
    pending: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [eventsByMonth, setEventsByMonth] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const menu = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Thống kê", route: "/admin/statistics" }
  ];

  // 🔹 Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/statistics");
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

    async function fetchChartData() {
      try {
        const res = await api.get("/admin/events-by-month");
        setEventsByMonth(res.data); // [{month:1,count:5},...]
      } catch (err) {
        console.error("Fetch chart data failed:", err);
      } finally {
        setLoadingChart(false);
      }
    }

    fetchStats();
    fetchChartData();
  }, []);

  // 🔹 Chart data
  const chartData = {
    labels: eventsByMonth.map(e => `Tháng ${e.month}`),
    datasets: [
      {
        label: "Số hoạt động",
        data: eventsByMonth.map(e => e.count),
        backgroundColor: "rgba(59, 130, 246, 0.6)"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Số hoạt động theo tháng" }
    },
    scales: { y: { beginAtZero: true, stepSize: 1 } }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={menu} />
      <div className="flex-1">
        <Topbar />
        <main className="px-4 sm:px-6 pt-24 pb-10 space-y-10">
          {/* HEADER */}
          <header>
            <h1 className="text-3xl font-bold text-indigo-700">
              Thống kê hệ thống
            </h1>
            <p className="text-gray-500 mt-1">
              Tổng quan số liệu và hoạt động theo tháng
            </p>
          </header>

          {/* STAT CARDS */}
          {loadingStats
            ? <div className="text-gray-500 italic">Đang tải dữ liệu...</div>
            : <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Tình nguyện viên"
                  value={stats.volunteers}
                  icon={Users}
                  color="blue"
                />
                <StatCard
                  title="Tổ chức"
                  value={stats.organizations}
                  icon={Building2}
                  color="green"
                />
                <StatCard
                  title="Hoạt động"
                  value={stats.events}
                  icon={Calendar}
                  color="yellow"
                />
                <StatCard
                  title="Chờ duyệt"
                  value={stats.pending}
                  icon={Clock}
                  color="red"
                />
              </section>}

          {/* BAR CHART */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Biểu đồ hoạt động theo tháng
            </h2>
            {loadingChart
              ? <p className="text-gray-500 italic">
                  Đang tải dữ liệu biểu đồ...
                </p>
              : <Bar data={chartData} options={chartOptions} />}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ================== STAT CARD COMPONENT ================== */
function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition-all cursor-pointer">
      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {value}
        </p>
      </div>
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${colorMap[
          color
        ]}`}
      >
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
}
