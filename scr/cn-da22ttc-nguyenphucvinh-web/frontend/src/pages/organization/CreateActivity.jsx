import { BarChart3, ClipboardList, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";
import ActivityForm from "../../components/ActivityForm";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function CreateActivity() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCreate(data) {
    try {
      setSubmitting(true);
      await axiosInstance.post("/organization/events", data);
      navigate("/org/activities");
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Tạo hoạt động thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50">
        <Topbar />

        <main className="px-4 sm:px-6 pt-24 pb-10">
          <div className="max-w-4xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-green-700">
                Tạo hoạt động mới
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Điền thông tin để tạo một hoạt động tình nguyện mới
              </p>
            </header>

            <ActivityForm onSubmit={handleCreate} loading={submitting} />
          </div>
        </main>
      </div>
    </div>
  );
}
