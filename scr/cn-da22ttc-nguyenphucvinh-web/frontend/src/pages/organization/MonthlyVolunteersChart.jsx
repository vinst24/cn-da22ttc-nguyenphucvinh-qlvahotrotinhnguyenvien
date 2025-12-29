import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function MonthlyVolunteersChart(props) {
  const data = {
    labels: [
      "T1","T2","T3","T4","T5","T6",
      "T7","T8","T9","T10","T11","T12"
    ],
    datasets: [
      {
        label: "Lượt tham gia",
        data: props.data,
        backgroundColor: "#2563eb",
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-4">
        Tình nguyện viên tham gia ({props.year})
      </h3>
      <Bar data={data} />
    </div>
  );
}
