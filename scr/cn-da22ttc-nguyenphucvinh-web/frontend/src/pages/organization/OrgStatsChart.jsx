import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function OrgStatsChart(props) {
  const data = {
    labels: ["Sắp diễn ra", "Đang diễn ra", "Đã kết thúc"],
    datasets: [
      {
        label: "Số hoạt động",
        data: [props.upcoming, props.ongoing, props.completed],
        backgroundColor: [
          "#3b82f6", // blue - UPCOMING
          "#16a34a", // green - ONGOING
          "#6b7280" // gray - FINISHED
        ],
        borderRadius: 8,
        barThickness: 50
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return " " + context.parsed.y + " hoạt động";
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        Biểu đồ trạng thái hoạt động
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
}
