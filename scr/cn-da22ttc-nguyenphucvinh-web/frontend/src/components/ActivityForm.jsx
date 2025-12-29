import {
  Activity,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Save,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ActivityForm(props) {
  var initialData = props.initialData || {};
  var onSubmit = props.onSubmit;
  var loading = props.loading;

  /* =========================
     STATE
  ========================= */
  const [form, setForm] = useState(function() {
    return {
      title: initialData.title || "",
      description: initialData.description || "",
      provinceId: initialData.provinceId || "",
      communeId: initialData.communeId || "",
      address: initialData.address || "",
      startDate: initialData.startDate
        ? initialData.startDate.slice(0, 16)
        : "",
      endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : "",
      status: initialData.status || "UPCOMING",
      maxParticipants: initialData.maxParticipants || ""
    };
  });

  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);

  /* =========================
     FETCH PROVINCES (DB)
  ========================= */
  useEffect(function() {
    axiosInstance
      .get("/locations/provinces")
      .then(function(res) {
        setProvinces(res.data || []);
      })
      .catch(function(err) {
        console.error("Load provinces failed", err);
      });
  }, []);

  /* =========================
     FETCH COMMUNES (DB)
  ========================= */
  useEffect(
    function() {
      if (!form.provinceId) {
        setCommunes([]);
        return;
      }

      axiosInstance
        .get("/locations/provinces/" + form.provinceId + "/communes")
        .then(function(res) {
          setCommunes(res.data || []);
        })
        .catch(function(err) {
          console.error("Load communes failed", err);
        });
    },
    [form.provinceId]
  );

  /* =========================
     AUTO STATUS
  ========================= */
  useEffect(
    function() {
      if (!form.startDate) return;
      if (form.status === "CANCELED") return;

      var autoStatus = calculateStatus(form.startDate, form.endDate);

      setForm(function(prev) {
        if (prev.status === autoStatus) return prev;
        return { ...prev, status: autoStatus };
      });
    },
    [form.startDate, form.endDate]
  );

  useEffect(
    function() {
      if (!initialData || !initialData.id) return;

      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        provinceId: initialData.provinceId || "",
        communeId: initialData.communeId || "",
        address: initialData.address || "",
        startDate: initialData.startDate
          ? initialData.startDate.slice(0, 16)
          : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : "",
        status: initialData.status || "UPCOMING",
        maxParticipants: initialData.maxVolunteers || ""
      });
    },
    [initialData]
  );

  /* =========================
     HELPERS
  ========================= */
  function calculateStatus(startDate, endDate) {
    var now = new Date();
    var start = new Date(startDate);
    var end = endDate ? new Date(endDate) : null;

    if (start > now) return "UPCOMING";
    if (end && now > end) return "FINISHED";
    return "ONGOING";
  }

  function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return "";

    var start = new Date(startDate);
    var end = new Date(endDate);
    if (end <= start) return "";

    var diff = Math.floor((end - start) / 60000);
    var days = Math.floor(diff / (60 * 24));
    var hours = Math.floor(diff % (60 * 24) / 60);

    var parts = [];
    if (days) parts.push(days + " ngày");
    if (hours) parts.push(hours + " giờ");

    return parts.join(" ");
  }

  function validateForm(data) {
    const errs = {}; // khởi tạo object lỗi

    var now = new Date();
    var start = data.startDate ? new Date(data.startDate) : null;
    var end = data.endDate ? new Date(data.endDate) : null;

    if (start && start < now) {
      errs.startDate = "Thời gian bắt đầu không được ở quá khứ";
    }

    if (start && end && end < start) {
      errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (data.maxParticipants && data.maxParticipants <= 0) {
      errs.maxParticipants = "Số lượng phải lớn hơn 0";
    }

    return errs;
  }

  /* =========================
     HANDLE
  ========================= */
  function handleChange(e) {
    var name = e.target.name;
    var value = e.target.value;

    if (name === "provinceId") {
      setForm(function(prev) {
        return { ...prev, provinceId: value, communeId: "" };
      });
      return;
    }

    setForm(function(prev) {
      return { ...prev, [name]: value };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    var errs = validateForm(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    onSubmit({
      ...form,
      provinceId: Number(form.provinceId),
      communeId: Number(form.communeId),
      maxVolunteers: Number(form.maxParticipants)
    });
  }

  var now = new Date();
  var canFinish = form.endDate && new Date(form.endDate) <= now;

  /* =========================
     RENDER
  ========================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-600" />
        Thông tin hoạt động
      </h2>

      {/* BASIC */}
      <Section title="Thông tin cơ bản">
        <Field label="Tên hoạt động" icon={Activity}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input"
          />
        </Field>

        <Field label="Mô tả" icon={FileText}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input"
          />
        </Field>

        <Field label="Địa chỉ chi tiết" icon={MapPin}>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="input"
          />
        </Field>
        <Field label="Số lượng tối đa tham gia" icon={Users}>
          <input
            type="number"
            min="1"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            className={
              "input " + (errors.maxParticipants ? "border-red-400" : "")
            }
          />
          {errors.maxParticipants &&
            <p className="text-sm text-red-600">
              {errors.maxParticipants}
            </p>}
        </Field>
      </Section>

      {/* LOCATION */}
      <Section title="Địa điểm">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Tỉnh / Thành phố">
            <select
              name="provinceId"
              value={form.provinceId}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Chọn tỉnh --</option>
              {provinces.map(function(p) {
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Xã / Phường">
            <select
              name="communeId"
              value={form.communeId}
              onChange={handleChange}
              disabled={!form.provinceId}
              className="input"
            >
              <option value="">-- Chọn xã --</option>
              {communes.map(function(c) {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </Field>
        </div>
      </Section>

      {/* TIME */}
      <Section title="Thời gian">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* START DATE */}
          <Field label="Ngày bắt đầu" icon={Calendar}>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={"input " + (errors.startDate ? "border-red-400" : "")}
            />
            {errors.startDate
              ? <p className="text-sm text-red-600">
                  {errors.startDate}
                </p>
              : null}
          </Field>

          {/* END DATE */}
          <Field label="Ngày kết thúc" icon={Clock}>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              min={form.startDate || ""}
              onChange={handleChange}
              disabled={!form.startDate}
              className={"input " + (errors.endDate ? "border-red-400" : "")}
            />
            {!form.startDate
              ? <p className="text-xs text-gray-500">
                  Vui lòng chọn ngày bắt đầu trước
                </p>
              : null}

            {errors.endDate
              ? <p className="text-sm text-red-600">
                  {errors.endDate}
                </p>
              : null}
          </Field>
        </div>

        {/* DURATION */}
        {form.startDate && form.endDate
          ? <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              Thời lượng:
              <span className="font-medium">
                {calculateDuration(form.startDate, form.endDate)}
              </span>
            </div>
          : null}
      </Section>

      {/* STATUS */}
      <Section title="Trạng thái">
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="input"
        >
          <option value="UPCOMING">Sắp diễn ra</option>
          <option value="ONGOING">Đang diễn ra</option>
          <option value="FINISHED" disabled={!canFinish}>
            Đã kết thúc
          </option>
          <option value="CANCELED">Đã hủy</option>
        </select>
      </Section>

      <button disabled={loading} className="btn-primary">
        <Save className="w-4 h-4" /> Lưu hoạt động
      </button>
    </form>
  );
}

/* UI */
function Section(props) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">
        {props.title}
      </h3>
      {props.children}
    </div>
  );
}

function Field(props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {props.label}
      </label>
      {props.children}
    </div>
  );
}
