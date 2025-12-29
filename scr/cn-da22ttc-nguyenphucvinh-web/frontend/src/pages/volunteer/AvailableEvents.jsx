import axios from "axios";
import {
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Megaphone
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

    try {
      await axios.post(
        "http://localhost:5000/api/volunteer/register-event/" + eventId,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setEvents(
        events.map(function(e) {
          if (e.id === eventId) {
            return { ...e, isRegistered: true };
          }
          return e;
        })
      );
    } catch (err) {
      var message = "Đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      alert(message);
    } finally {
      setRegisteringIds(
        registeringIds.filter(function(id) {
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

                    return (
                      <div
                        key={e.id}
                        className="bg-white rounded-xl shadow p-5 hover:shadow-md transition"
                      >
                        <h3 className="font-semibold text-lg">
                          {e.title}
                        </h3>

                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" /> {displayDate}
                        </div>

                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {displayAddress}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={function() {
                              setSelectedEvent(e);
                            }}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                          >
                            Xem chi tiết
                          </button>

                          <button
                            onClick={function() {
                              handleRegister(e.id);
                            }}
                            disabled={
                              e.isRegistered ||
                              registeringIds.indexOf(e.id) !== -1
                            }
                            className={
                              e.isRegistered
                                ? "bg-gray-400 cursor-not-allowed flex-1 py-2 rounded-lg"
                                : "bg-green-600 text-white hover:bg-green-700 flex-1 py-2 rounded-lg"
                            }
                          >
                            {e.isRegistered ? "Đã đăng ký" : "Đăng ký"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>}

          {/* Popup xem chi tiết */}
          {selectedEvent &&
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={function() {
                setSelectedEvent(null);
              }}
            >
              <div
                className="bg-white rounded-xl p-6 w-11/12 max-w-lg"
                onClick={function(e) {
                  e.stopPropagation();
                }}
              >
                <h2 className="text-xl font-bold mb-2">
                  {selectedEvent.title}
                </h2>
                <p className="text-gray-600 mb-2">
                  {selectedEvent.description}
                </p>
                <div className="text-sm text-gray-500 flex gap-2 mb-4">
                  <CalendarDays className="w-4 h-4" />{" "}
                  {selectedEvent.startDate
                    ? new Date(selectedEvent.startDate).toLocaleDateString()
                    : "-"}
                </div>
                <div className="text-sm text-gray-500 flex gap-2 mb-4">
                  <MapPin className="w-4 h-4" />{" "}
                  {selectedEvent.address && selectedEvent.address !== ""
                    ? selectedEvent.address
                    : selectedEvent.commune && selectedEvent.commune.name
                      ? selectedEvent.commune.name
                      : "Không xác định"}
                </div>

                <button
                  onClick={function() {
                    setSelectedEvent(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                  Đóng
                </button>
              </div>
            </div>}
        </main>
      </div>
    </div>
  );
}
