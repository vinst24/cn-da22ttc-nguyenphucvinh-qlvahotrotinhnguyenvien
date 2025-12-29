import {
  BarChart3,
  Calendar,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function OrgActivities() {
  const navigate = useNavigate();

  /* ======================
     Sidebar menu
  ====================== */
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

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     Fetch events
  ====================== */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/organization/events");
        setEvents(res.data && res.data.events ? res.data.events : []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /* ======================
     Delete event
  ====================== */
  const handleDelete = async id => {
    if (!window.confirm("Bạn có chắc muốn xoá hoạt động này?")) return;

    try {
      await axiosInstance.delete("/organization/events/" + id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Xoá hoạt động thất bại");
    }
  };

  return (
    <div className="flex">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50 min-h-screen">
        <Topbar sidebarWidth="16rem" />
        <div className="h-16" />
        <main className="pt-16 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-green-700">
                Quản lý hoạt động
              </h1>
              <p className="text-gray-600 mt-1">
                Danh sách các hoạt động do tổ chức tạo
              </p>
            </div>

            <button
              onClick={() => navigate("/org/activities/create")}
              className="inline-flex items-center gap-2 bg-green-600 text-white
                px-4 py-2 rounded-lg font-medium
                hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              Tạo hoạt động
            </button>
          </div>

          {/* Content */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? <div className="text-gray-500 italic">Đang tải dữ liệu...</div>
              : events.length === 0
                ? <div className="text-gray-500 italic">
                    Chưa có hoạt động nào
                  </div>
                : events.map(event =>
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() =>
                        navigate("/org/activities/" + event.id + "/edit")}
                      onDelete={() => handleDelete(event.id)}
                      onViewParticipants={() =>
                        navigate(
                          "/org/activities/" + event.id + "/participants"
                        )}
                    />
                  )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ======================
   Event Card Component
====================== */
function EventCard(props) {
  const { event, onEdit, onDelete, onViewParticipants } = props;

  const statusClass = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    FINISHED: "bg-gray-200 text-gray-700",
    CANCELED: "bg-red-100 text-red-700"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border
      hover:shadow-md transition p-5 flex flex-col justify-between">
      <div>
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-snug line-clamp-2">
            {event.title}
          </h3>

          <span
            className={
              "text-xs font-medium px-2 py-1 rounded-full " +
              (statusClass[event.status] || "bg-gray-100 text-gray-600")
            }
          >
            {event.status}
          </span>
        </div>

        {/* Date */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {event.startDate
            ? new Date(event.startDate).toLocaleDateString("vi-VN")
            : "-"}
        </div>
      </div>
      {/* Participants */}
      <div
        className={
          "mt-2 flex items-center gap-1 text-sm " +
          (event.currentParticipants >= event.maxVolunteers
            ? "text-red-600"
            : "text-gray-600")
        }
      >
        <Users className="w-4 h-4" />
        <span>
          {event.currentParticipants} / {event.maxVolunteers}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-3 py-1.5
            text-sm border rounded-lg hover:bg-gray-100 transition"
        >
          <Pencil className="w-4 h-4" />
          Sửa
        </button>

        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-3 py-1.5
            text-sm border border-red-300 text-red-600
            rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          Xoá
        </button>
        <button
          onClick={onViewParticipants}
          className="inline-flex items-center gap-1 px-3 py-1.5
    text-sm border rounded-lg hover:bg-gray-100 transition"
        >
          <Users className="w-4 h-4" />
          Người tham gia
        </button>
      </div>
    </div>
  );
}
