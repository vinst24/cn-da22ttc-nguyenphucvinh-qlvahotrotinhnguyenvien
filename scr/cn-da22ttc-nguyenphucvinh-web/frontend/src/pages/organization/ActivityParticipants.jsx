import { BarChart3, ClipboardList, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function ActivityParticipants() {
  const { id } = useParams(); // eventId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);

  /* ======================
     Sidebar menu (ORG)
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

  /* ======================
     Fetch participants
  ====================== */
  useEffect(
    function() {
      const fetchParticipants = async function() {
        try {
          const res = await axiosInstance.get(
            "/organization/events/" + id + "/participants"
          );

          if (res.data && res.data.participants) {
            setParticipants(res.data.participants);
          } else {
            setParticipants([]);
          }
        } catch (err) {
          console.error("Load participants failed:", err);
          alert("Không tải được danh sách tham gia");
        } finally {
          setLoading(false);
        }
      };

      fetchParticipants();
    },
    [id]
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-green-50">
        <Topbar sidebarWidth="16rem" />

        <main className="pt-24 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-green-700">
                Danh sách tình nguyện viên tham gia
              </h1>

              <button
                onClick={function() {
                  navigate("/org/activities");
                }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
              >
                Quay lại
              </button>
            </div>

            {loading
              ? <div className="text-gray-500 italic">Đang tải dữ liệu...</div>
              : participants.length === 0
                ? <div className="text-gray-500 italic">
                    Chưa có tình nguyện viên tham gia
                  </div>
                : <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 text-left">
                        <tr>
                          <th className="px-4 py-3">Họ tên</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Số điện thoại</th>
                          <th className="px-4 py-3">Ngày tham gia</th>
                        </tr>
                      </thead>

                      <tbody>
                        {participants.map(function(p) {
                          return (
                            <tr key={p.id} className="border-t">
                              <td className="px-4 py-3 font-medium">
                                {p.fullName}
                              </td>
                              <td className="px-4 py-3">
                                {p.email}
                              </td>
                              <td className="px-4 py-3">
                                {p.phone}
                              </td>
                              <td className="px-4 py-3">
                                {p.joinedAt
                                  ? new Date(p.joinedAt).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>}
          </div>
        </main>
      </div>
    </div>
  );
}
