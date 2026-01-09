// pages/admin/Statistics.jsx
import {
  ArcElement,
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
import { Bar, Doughnut } from "react-chartjs-2";

import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  const [chartError, setChartError] = useState(null);

  const menu = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Thống kê", route: "/admin/statistics" }
  ];

  // 🔹 Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        console.log("🔍 Fetching /admin/statistics...");
        const res = await api.get("/admin/statistics");
        console.log("✅ Stats response:", res.data);
        if (res.data) {
          setStats({
            volunteers: res.data.volunteers || 0,
            organizations: res.data.organizations || 0,
            events: res.data.events || 0,
            pending: res.data.pending || 0
          });
        }
      } catch (err) {
        console.error("❌ Fetch stats failed:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    async function fetchChartData() {
      try {
        console.log("🔍 Fetching /admin/events-by-month...");
        const res = await api.get("/admin/events-by-month");
        console.log("✅ Events by month response status:", res.status);
        console.log("✅ Events by month data:", res.data);
        
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setEventsByMonth(res.data);
          console.log("📊 Chart data set successfully, count:", res.data.length);
          setChartError(null);
        } else if (res.data && Array.isArray(res.data)) {
          console.warn("⚠️ Response is empty array, using fallback data");
          // Use fallback data
          const fallbackData = [
            {month: 1, count: 8},
            {month: 2, count: 1},
            {month: 3, count: 0},
            {month: 4, count: 0},
            {month: 5, count: 0},
            {month: 6, count: 0},
            {month: 7, count: 0},
            {month: 8, count: 0},
            {month: 9, count: 0},
            {month: 10, count: 0},
            {month: 11, count: 0},
            {month: 12, count: 0}
          ];
          setEventsByMonth(fallbackData);
          setChartError("(Fallback data)");
        } else {
          console.warn("⚠️ Response is not an array:", res.data);
          setChartError("API response không đúng format");
        }
      } catch (err) {
        console.error("❌ Fetch chart data failed:", err.message);
        console.error("❌ Error code:", err.code);
        console.error("❌ Error response:", err.response?.data);
        setChartError(`Lỗi fetch: ${err.message}`);
        
        // Use fallback data
        console.log("🔄 Using fallback data...");
        const fallbackData = [
          {month: 1, count: 8},
          {month: 2, count: 1},
          {month: 3, count: 0},
          {month: 4, count: 0},
          {month: 5, count: 0},
          {month: 6, count: 0},
          {month: 7, count: 0},
          {month: 8, count: 0},
          {month: 9, count: 0},
          {month: 10, count: 0},
          {month: 11, count: 0},
          {month: 12, count: 0}
        ];
        setEventsByMonth(fallbackData);
        setChartError(`Lỗi fetch (fallback): ${err.message}`);
      } finally {
        setLoadingChart(false);
      }
    }

    fetchStats();
    fetchChartData();
  }, []);

  // 🔹 Chart data
  const chartData = {
    labels: eventsByMonth && eventsByMonth.length > 0 
      ? eventsByMonth.map(e => `Tháng ${e.month}`)
      : ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
         "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
    datasets: [
      {
        label: "Số hoạt động",
        data: eventsByMonth && eventsByMonth.length > 0
          ? eventsByMonth.map(e => e.count)
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4
      }
    ]
  };

  // 🔹 Pie chart data
  const pieData = {
    labels: ["Hoạt động được duyệt", "Chờ duyệt"],
    datasets: [
      {
        label: "Trạng thái hoạt động",
        data: [stats.events - stats.pending, stats.pending],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2
      }
    ]
  };

  // 🔹 Organization distribution
  const orgData = {
    labels: ["Tổ chức", "Tình nguyện viên", "Hoạt động"],
    datasets: [
      {
        label: "Số lượng",
        data: [stats.organizations, stats.volunteers, stats.events],
        backgroundColor: [
          "rgba(168, 85, 247, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(34, 197, 94, 0.6)"
        ],
        borderColor: [
          "rgba(168, 85, 247, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)"
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true } },
      title: { display: true, text: "Số hoạt động theo tháng", font: { size: 14 } }
    },
    scales: { 
      y: { beginAtZero: true, stepSize: 1, ticks: { callback: value => Math.round(value) } } 
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true } },
      title: { display: true, text: "Trạng thái duyệt hoạt động", font: { size: 14 } }
    }
  };

  const barOptions = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "So sánh thống kê chung", font: { size: 14 } }
    },
    scales: { x: { beginAtZero: true } }
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

          {/* CHARTS GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BAR CHART - Monthly Events */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                📊 Hoạt động theo tháng
              </h2>
              {loadingChart
                ? <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
                : <>
                    {chartError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-red-700 text-sm">
                          <strong>⚠️ Lỗi:</strong> {chartError}
                        </p>
                      </div>
                    )}
                    
                    {eventsByMonth && eventsByMonth.length > 0 ? (
                      <Bar data={chartData} options={chartOptions} />
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                        <p className="text-yellow-700 font-semibold">
                          ⚠️ Không có dữ liệu hoạt động
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                          eventsByMonth: {JSON.stringify(eventsByMonth)}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          Status: {loadingChart ? "Loading..." : "Done"}
                        </p>
                      </div>
                    )}
                  </>}
            </div>

            {/* PIE CHART - Event Status */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                ✅ Trạng thái hoạt động
              </h2>
              {loadingChart
                ? <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
                : <Doughnut data={pieData} options={pieOptions} />}
            </div>

            {/* HORIZONTAL BAR CHART - Overall Stats */}
            <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                📈 Thống kê chung
              </h2>
              {loadingStats
                ? <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
                : <Bar data={orgData} options={barOptions} />}
            </div>
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
