import { Calendar, CalendarCheck, CheckCircle, LayoutDashboard, MapPin, Megaphone, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  useEffect(
    () => {
      const fetchEvent = async () => {
        try {
          const res = await api.get(`/events/${id}`);
          setEvent(res.data.event);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    },
    [id]
  );

  const handleJoin = async () => {
    try {
      setJoining(true);
      await api.post(`/events/${id}/register`);
      alert("Đăng ký hoạt động thành công");
      navigate("/volunteer/registered-events");
    } catch (err) {
      console.error(err);
      alert("Không thể đăng ký");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (!event) {
    return <div className="p-6">Không tìm thấy hoạt động</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="p-6 pt-24 flex justify-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6 space-y-5">
            <header>
              <h1 className="text-2xl font-bold text-indigo-700">
                {event.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {event.shortDescription}
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <Info icon={Calendar} label="Thời gian" value={event.date} />
              <Info icon={MapPin} label="Địa điểm" value={event.location} />
              <Info
                icon={Users}
                label="Số lượng"
                value={`${event.joined}/${event.capacity}`}
              />
              <Info
                icon={CheckCircle}
                label="Trạng thái"
                value={event.status}
              />
            </div>

            <section>
              <h3 className="font-semibold mb-2">Mô tả chi tiết</h3>
              <p className="text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </section>

            <button
              onClick={handleJoin}
              disabled={joining}
              className={`w-full py-3 rounded-lg font-semibold text-white
                ${joining
                  ? "bg-indigo-300"
                  : "bg-indigo-600 hover:bg-indigo-700"}
              `}
            >
              {joining ? "Đang xử lý..." : "Đăng ký tham gia"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-indigo-600" />
      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>
        <p className="font-medium">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
