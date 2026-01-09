import axios from "axios";
import {
    AlertCircle,
    CalendarDays,
    LayoutDashboard,
    MapPin,
    Megaphone,
    Users,
    X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function AvailableEvents() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const token = auth && auth.accessToken;
  const user = auth && auth.user;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeringIds, setRegisteringIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const menu = [
    {
      label: "Hoạt động khả dụng",
      route: "/volunteer/available-events",
      icon: Megaphone
    },
    {
      label: "Hoạt động đã đăng ký",
      route: "/volunteer/registered-events",
      icon: CalendarDays
    },
    {
      label: "Thông tin cá nhân",
      route: "/volunteer/profile",
      icon: LayoutDashboard
    }
  ];

  // Fetch available events
  useEffect(
    function() {
      const fetchEvents = async function() {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/volunteer/available",
            { headers: { Authorization: "Bearer " + token } }
          );

          if (res.data && Array.isArray(res.data.events)) {
            setEvents(res.data.events);
          } else {
            setEvents([]);
          }
        } catch (err) {
          if (
            err.response &&
            (err.response.status === 401 || err.response.status === 403)
          ) {
            localStorage.clear();
            navigate("/login");
          } else {
            console.error(err);
          }
        } finally {
          setLoading(false);
        }
      };

      if (token) fetchEvents();
    },
    [token, navigate]
  );

  const handleRegister = async function(eventId) {
    if (!token) {
      navigate("/login");
      return;
    }

    setRegisteringIds(registeringIds.concat(eventId));
    setErrorMsg("");

    try {
      await axios.post(
        "http://localhost:5000/api/volunteer/register-event/" + eventId,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      // Optimistically update local state so UI reflects registration immediately
      setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, isRegistered: true, currentParticipants: (e.currentParticipants || 0) + 1 } : e)));
      setSelectedEvent(null);

      // Then refresh from server to ensure accurate data (in background)
      try {
        const res = await axios.get(
          "http://localhost:5000/api/volunteer/available",
          { headers: { Authorization: "Bearer " + token } }
        );
        if (res.data && Array.isArray(res.data.events)) {
          setEvents(res.data.events);
        }
      } catch (e) {
        // ignore background refresh errors
      }
    } catch (err) {
      var message = "Đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setRegisteringIds(
        registeringIds.filter(function(id) {
          return id !== eventId;
        })
      );
    }
  };

  const isEventFull = function(event) {
    return event.maxVolunteers > 0 && event.currentParticipants >= event.maxVolunteers;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />
      <div className="flex-1 bg-indigo-50">
        <Topbar />
        <main className="p-6 pt-24">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">
            Hoạt động khả dụng
          </h1>

          {loading
            ? <div className="text-gray-500">Đang tải...</div>
            : events.length === 0
              ? <div className="text-gray-500 italic">Không có hoạt động</div>
              : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(function(e) {
                    var communeName = "";
                    if (e.commune && e.address) communeName = e.address;

                    var displayAddress = "";
                    if (e.address && e.address !== "")
                      displayAddress = e.address;
                    else if (communeName !== "") displayAddress = communeName;
                    else displayAddress = "Không xác định";

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

                    var isFull = isEventFull(e);
                    var isRegistering = registeringIds.indexOf(e.id) !== -1;

                    return (
                      <div
                        key={e.id}
                        className={`bg-white rounded-xl shadow p-5 hover:shadow-md transition ${
                          isFull ? "opacity-75" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-indigo-700">
                              {e.title}
                            </h3>
                            {e.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {e.description}
                              </p>
                            )}
                          </div>
                          {isFull && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold">
                              Đã đầy
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" /> {displayDate}
                        </div>

                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {displayAddress}
                        </div>

                        <div className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                          <Users className="w-4 h-4" /> 
                          <span>{e.currentParticipants || 0}/{e.maxVolunteers || "Không giới hạn"}</span>
                        </div>

                        {e.organizationName && (
                          <div className="text-sm text-gray-500 mt-2">
                            <span className="text-gray-600">Tổ chức:</span> {e.organizationName}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={function() {
                              setSelectedEvent(e);
                              setErrorMsg("");
                            }}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                          >
                            Xem chi tiết
                          </button>

                          <button
                            onClick={function() {
                              handleRegister(e.id);
                            }}
                            disabled={isFull || isRegistering}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${
                              isFull
                                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isRegistering ? "Đang xử lý..." : "Đăng ký"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>}

          {/* Popup xem chi tiết */}
          {selectedEvent &&
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
              onClick={function() {
                setSelectedEvent(null);
              }}
            >
              <div
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={function(e) {
                  e.stopPropagation();
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-700">
                      {selectedEvent.title}
                    </h2>
                    {selectedEvent.organizationName && (
                      <p className="text-gray-600 text-sm mt-1">
                        Tổ chức: <span className="font-semibold">{selectedEvent.organizationName}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={function() {
                      setSelectedEvent(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errorMsg}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian bắt đầu</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedEvent.startDate
                        ? new Date(selectedEvent.startDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian kết thúc</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedEvent.endDate
                        ? new Date(selectedEvent.endDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Địa điểm</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.address && selectedEvent.address !== ""
                        ? selectedEvent.address
                        : "Không xác định"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Số người tham gia</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedEvent.currentParticipants || 0}/{selectedEvent.maxVolunteers || "Không giới hạn"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={function() {
                      setSelectedEvent(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-3 rounded-lg transition"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={function() {
                      handleRegister(selectedEvent.id);
                    }}
                    disabled={isEventFull(selectedEvent) || registeringIds.indexOf(selectedEvent.id) !== -1}
                    className={`flex-1 font-semibold px-4 py-3 rounded-lg transition ${
                      isEventFull(selectedEvent)
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {registeringIds.indexOf(selectedEvent.id) !== -1 ? "Đang xử lý..." : "Đăng ký ngay"}
                  </button>
                </div>
              </div>
            </div>}
        </main>
      </div>
    </div>
  );
}
