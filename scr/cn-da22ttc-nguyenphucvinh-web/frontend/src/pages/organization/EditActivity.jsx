import { BarChart3, ClipboardList, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ActivityForm from "../../components/ActivityForm";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function EditActivity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);

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
    { label: "Thống kê tổ chức", route: "/org/stats", icon: BarChart3 }
  ];

  useEffect(
    () => {
      const fetchEvent = async () => {
        try {
          const res = await axiosInstance.get("/organization/events/" + id);

          setEvent({
            ...res.data,
            startDate: res.data.startDate
              ? res.data.startDate.slice(0, 16)
              : "",
            endDate: res.data.endDate ? res.data.endDate.slice(0, 16) : "",
            maxParticipants: (res.data.maxVolunteers != null) ? res.data.maxVolunteers : ""
          });
        } catch (err) {
          console.error("Failed to fetch event:", err);
          alert("Không tìm thấy hoạt động");
          navigate("/org/activities");
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    },
    [id, navigate]
  );

  const handleUpdate = async data => {
    try {
      setSubmitting(true);
      await axiosInstance.put("/organization/events/" + id, data);
      navigate("/org/activities");
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50 min-h-screen">
        <Topbar />

        <main className="p-6 pt-24 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-6">
            Chỉnh sửa hoạt động
          </h1>

          <ActivityForm
            initialData={event}
            onSubmit={handleUpdate}
            loading={submitting}
          />
        </main>
      </div>
    </div>
  );
}
