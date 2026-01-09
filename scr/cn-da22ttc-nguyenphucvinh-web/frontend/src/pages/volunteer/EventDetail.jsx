import axios from "axios";
import { AlertCircle, Calendar, CalendarCheck, CheckCircle, LayoutDashboard, MapPin, Megaphone, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/useAuth";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const token = auth && auth.accessToken;
  const user = auth && auth.user;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const menu = [
    { label: "Hoạt động khả dụng", route: "/volunteer/available-events", icon: Megaphone },
    { label: "Hoạt động đã đăng ký", route: "/volunteer/registered-events", icon: CalendarCheck },
    { label: "Thông tin cá nhân", route: "/volunteer/profile", icon: LayoutDashboard }
  ];

  useEffect(
    () => {
      const fetchEvent = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/events/${id}`,
            token ? { headers: { Authorization: "Bearer " + token } } : {}
          );
          setEvent(res.data.event);
          setIsRegistered(res.data.event.isRegistered || false);
        } catch (err) {
          console.error(err);
          setMessage({
            type: "error",
            text: "Không thể tải thông tin hoạt động"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    },
    [id, token]
  );

  const isEventFull = () => {
    return event && event.maxVolunteers > 0 && 
           event.currentParticipants >= event.maxVolunteers;
  };

  const handleRegister = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setActionInProgress(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `http://localhost:5000/api/volunteer/register-event/${id}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );
      
      // Cập nhật state để hiển thị badge "Đã đăng ký" và disable nút
      setIsRegistered(true);
      
      // Cập nhật số lượng người tham gia
      setEvent(prevEvent => ({
        ...prevEvent,
        currentParticipants: (prevEvent.currentParticipants || 0) + 1
      }));
      
      setMessage({
        type: "success",
        text: "Đăng ký hoạt động thành công!"
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      var errorMsg = "Đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setMessage({
        type: "error",
        text: errorMsg
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký?")) {
      return;
    }

    setActionInProgress(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `http://localhost:5000/api/volunteer/unregister-event/${id}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );
      
      // Cập nhật state để ẩn badge "Đã đăng ký" và hiển thị nút "Đăng ký"
      setIsRegistered(false);
      
      // Cập nhật số lượng người tham gia
      setEvent(prevEvent => ({
        ...prevEvent,
        currentParticipants: Math.max(0, (prevEvent.currentParticipants || 1) - 1)
      }));
      
      setMessage({
        type: "success",
        text: "Hủy đăng ký thành công!"
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      var errorMsg = "Hủy đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setMessage({
        type: "error",
        text: errorMsg
      });
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar items={menu} />
        <div className="flex-1 bg-indigo-50 flex items-center justify-center">
          <Topbar />
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen">
        <Sidebar items={menu} />
        <div className="flex-1 bg-indigo-50">
          <Topbar />
          <div className="p-6 pt-24 text-gray-500">Không tìm thấy hoạt động</div>
        </div>
      </div>
    );
  }

  var displayStartDate = "-";
  if (event.startDate) {
    var d = new Date(event.startDate);
    displayStartDate =
      d.getDate().toString().padStart(2, "0") +
      "/" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      d.getFullYear();
  }

  var displayEndDate = "-";
  if (event.endDate) {
    var d = new Date(event.endDate);
    displayEndDate =
      d.getDate().toString().padStart(2, "0") +
      "/" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      d.getFullYear();
  }

  const isFull = isEventFull();

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menu} />

      <div className="flex-1 bg-indigo-50 min-h-screen">
        <Topbar />

        <main className="p-6 pt-24 flex justify-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-indigo-700">
                {event.title}
              </h1>
              {event.organizationName && (
                <p className="text-gray-600 mt-2">
                  Tổ chức: <span className="font-semibold">{event.organizationName}</span>
                </p>
              )}
            </header>

            {/* Messages */}
            {message.text && (
              <div className={`mb-4 p-4 rounded-lg flex gap-3 items-start ${
                message.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}>
                {message.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Status Badge */}
            {isRegistered && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Bạn đã đăng ký hoạt động này</span>
              </div>
            )}

            {isFull && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-semibold">Hoạt động đã đạt số người tham gia tối đa</span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <section className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Mô tả chi tiết</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </section>
            )}

            {/* Info Grid */}
            <section className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Thông tin sự kiện</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-semibold text-gray-600 uppercase">Ngày bắt đầu</p>
                  </div>
                  <p className="text-gray-900 font-semibold">{displayStartDate}</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-semibold text-gray-600 uppercase">Ngày kết thúc</p>
                  </div>
                  <p className="text-gray-900 font-semibold">{displayEndDate}</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-semibold text-gray-600 uppercase">Địa điểm</p>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {event.address || "Chưa xác định"}
                  </p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-semibold text-gray-600 uppercase">Số người tham gia</p>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {event.currentParticipants || 0}/{event.maxVolunteers || "Không giới hạn"}
                  </p>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Register/Unregister Button */}
              {isRegistered ? (
                <>
                  <button
                    disabled={true}
                    className="w-full font-semibold py-3 px-4 rounded-lg transition bg-gray-300 text-gray-600 cursor-not-allowed"
                  >
                    ✓ Đã đăng ký
                  </button>
                  <button
                    onClick={handleUnregister}
                    disabled={actionInProgress}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                      actionInProgress
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {actionInProgress ? "Đang xử lý..." : "Hủy đăng ký"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={actionInProgress || isFull || !token}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                    !token
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : isFull
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {actionInProgress
                    ? "Đang xử lý..."
                    : !token
                      ? "Đăng nhập để đăng ký"
                      : "Đăng ký ngay"}
                </button>
              )}

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Quay lại
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
