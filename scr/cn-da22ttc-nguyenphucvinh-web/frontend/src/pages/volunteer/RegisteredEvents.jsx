import axios from "axios";
import { AlertCircle, CalendarCheck, LayoutDashboard, MapPin, Megaphone, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function RegisteredEvents() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const user = auth && auth.user;
  const token = auth && auth.accessToken;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unregisteringIds, setUnregisteringIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  useEffect(function () {
    const fetchEvents = async function () {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/volunteer/" + user.id + "/events",
          { headers: { Authorization: "Bearer " + token } }
        );
        setEvents(res.data.events || []);
        setErrorMsg("");
      } catch (err) {
        console.error(err);
        setErrorMsg("Không thể tải danh sách hoạt động");
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchEvents();
    }
  }, [user, token]);

  const handleUnregister = async function(eventId) {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký hoạt động này?")) {
      return;
    }

    setUnregisteringIds(unregisteringIds.concat(eventId));
    setErrorMsg("");

    try {
      await axios.post(
        "http://localhost:5000/api/volunteer/unregister-event/" + eventId,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      // Cập nhật danh sách
      setEvents(events.filter(function(e) {
        return e.id !== eventId;
      }));
      setSuccessMsg("Hủy đăng ký thành công!");
      setTimeout(function() {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      var message = "Hủy đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }
      setErrorMsg(message);
    } finally {
      setUnregisteringIds(
        unregisteringIds.filter(function(id) {
          return id !== eventId;
        })
      );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50">
        <Topbar />

        <main className="p-6 pt-24">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">
            Hoạt động đã đăng ký
          </h1>

          {successMsg && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <p className="text-green-700 font-medium">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">
              Bạn chưa đăng ký hoạt động nào
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map(function (e) {
                var displayDate = "-";
                if (e.startDate) {
                  var d = new Date(e.startDate);
                  displayDate =
                    d.getDate().toString().padStart(2, "0") +
                    "/" +
                    (d.getMonth() + 1).toString().padStart(2, "0") +
                    "/" +
                    d.getFullYear();
                }

                var isUnregistering = unregisteringIds.indexOf(e.id) !== -1;

                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-indigo-700">
                          {e.title}
                        </h3>

                        {e.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {e.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarCheck className="w-4 h-4" />
                            {displayDate}
                          </div>

                          {e.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {e.address}
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {e.currentParticipants || 0}/{e.maxVolunteers || "Không giới hạn"}
                          </div>
                        </div>

                        {e.organizationName && (
                          <div className="text-sm text-gray-500 mt-2">
                            Tổ chức: <span className="font-medium text-gray-700">{e.organizationName}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={function() {
                          handleUnregister(e.id);
                        }}
                        disabled={isUnregistering}
                        className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                          isUnregistering
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {isUnregistering ? "Đang xử lý..." : "Hủy"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
