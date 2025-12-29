import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

/* =======================
   MAIN COMPONENT
======================= */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await api.get("/admin/events");
      if (res.data && res.data.events) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(eventId) {
    if (!window.confirm("Bạn có chắc muốn duyệt hoạt động này?")) return;

    try {
      setApprovingId(eventId);
      const res = await api.put(`/admin/events/${eventId}/approve`);

      // Update event list
      setEvents(prev =>
        prev.map(e => (e.id === eventId ? { ...e, ...res.data } : e))
      );

      // 🔄 Dispatch sự kiện để dashboard fetch lại stats
      window.dispatchEvent(new Event("refreshAdminStats"));
    } catch (error) {
      console.error(error);
      alert("Duyệt hoạt động thất bại!");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={[{ label: "Dashboard", route: "/admin/dashboard" }]} />

      <div className="flex-1">
        <Topbar />

        <main className="px-6 pt-24 pb-10">
          {/* HEADER */}
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-indigo-600" />
              Quản lý Hoạt động
            </h2>
            <p className="text-gray-500 mt-1">
              Danh sách tất cả hoạt động trong hệ thống
            </p>
          </header>

          {/* CONTENT */}
          {loading
            ? <Loading />
            : <EventTable
                events={events}
                approvingId={approvingId}
                onApprove={handleApprove}
                onView={setSelectedEvent}
              />}

          {/* MODAL */}
          {selectedEvent &&
            <EventDetailModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />}
        </main>
      </div>
    </div>
  );
}

/* =======================
   TABLE
======================= */
function EventTable({ events, approvingId, onApprove, onView }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <Th>ID</Th>
            <Th>Tiêu đề</Th>
            <Th>Tổ chức</Th>
            <Th>Địa chỉ</Th>
            <Th>Trạng thái</Th>
            <Th>Ngày bắt đầu</Th>
            <Th>Hành động</Th>
          </tr>
        </thead>

        <tbody>
          {events.map(event => {
            const orgName =
              event.organization && event.organization.name
                ? event.organization.name
                : "—";

            const startDate = event.startDate
              ? new Date(event.startDate).toLocaleDateString("vi-VN")
              : "—";

            return (
              <tr
                key={event.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <Td mono>
                  #{event.id}
                </Td>

                <Td title={event.title}>
                  {event.title || "—"}
                </Td>

                <Td title={orgName}>
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {orgName}
                  </div>
                </Td>

                <Td title={event.address}>
                  {event.address || "—"}
                </Td>

                <Td>
                  <StatusBadge
                    status={event.status}
                    isApproved={event.isApproved}
                  />
                </Td>

                <Td>
                  {startDate}
                </Td>

                <Td>
                  <div className="flex gap-1">
                    {!event.isApproved
                      ? <button
                          onClick={() => onApprove(event.id)}
                          disabled={approvingId === event.id}
                          className="btn-primary"
                        >
                          {approvingId === event.id ? "Đang duyệt..." : "Duyệt"}
                        </button>
                      : <span className="text-gray-400 text-xs">Đã duyệt</span>}

                    <button
                      onClick={() => onView(event)}
                      className="btn-secondary flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
   MODAL
======================= */
function EventDetailModal({ event, onClose }) {
  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString("vi-VN") : "—";
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h3 className="text-xl font-bold mb-4">
          {event.title || "—"}
        </h3>

        <Info label="Trạng thái">
          {event.isApproved ? event.status : "Chưa duyệt"}
        </Info>

        <Info label="Tổ chức">
          {event.organization && event.organization.name
            ? event.organization.name
            : "—"}
        </Info>

        <Info label="Địa chỉ">
          {event.address || "—"}
        </Info>
        <Info label="Ngày bắt đầu">
          {formatDate(event.startDate)}
        </Info>
        <Info label="Ngày kết thúc">
          {formatDate(event.endDate)}
        </Info>

        {event.description &&
          <Info label="Mô tả">
            {event.description}
          </Info>}
      </div>
    </div>
  );
}

/* =======================
   SMALL COMPONENTS
======================= */
function StatusBadge({ status, isApproved }) {
  if (!isApproved) {
    return <Badge color="gray" icon={Clock} text="Chưa duyệt" />;
  }

  if (status === "UPCOMING") {
    return <Badge color="blue" icon={Clock} text="Sắp diễn ra" />;
  }

  if (status === "ONGOING") {
    return <Badge color="green" icon={CheckCircle} text="Đang diễn ra" />;
  }

  if (status === "CANCELED") {
    return <Badge color="red" icon={XCircle} text="Đã hủy" />;
  }

  return <Badge color="gray" text="—" />;
}

function Badge({ color, icon: Icon, text }) {
  const colors = {
    gray: "text-gray-700 bg-gray-100",
    blue: "text-blue-700 bg-blue-50",
    green: "text-green-700 bg-green-50",
    red: "text-red-700 bg-red-50"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors[
        color
      ]}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {text}
    </span>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono, title }) {
  return (
    <td
      title={title}
      className={`px-4 py-3 truncate ${mono ? "font-mono" : "text-gray-700"}`}
    >
      {children}
    </td>
  );
}

function Info({ label, children }) {
  return (
    <p className="mb-1">
      <strong>{label}:</strong> {children}
    </p>
  );
}

function Loading() {
  return (
    <div className="text-center py-10 text-gray-500 italic">
      Đang tải dữ liệu...
    </div>
  );
}
