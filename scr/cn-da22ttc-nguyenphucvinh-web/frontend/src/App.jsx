import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AvailableEvents from "./pages/volunteer/AvailableEvents";
import EventDetail from "./pages/volunteer/EventDetail";
import RegisteredEvents from "./pages/volunteer/RegisteredEvents";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerNotifications from "./pages/volunteer/VolunteerNotifications";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";

import ActivityParticipants from "./pages/organization/ActivityParticipants";
import CreateActivity from "./pages/organization/CreateActivity";
import EditActivity from "./pages/organization/EditActivity.jsx";
import OrgActivities from "./pages/organization/OrgActivities";
import OrgDashboard from "./pages/organization/OrgDashboard";
import OrgSettings from "./pages/organization/OrgSettings";
import OrgStats from "./pages/organization/OrgStats";
import OrgVolunteers from "./pages/organization/OrgVolunteers";

import AddOrganizationForm from "./pages/admin/AddOrganizationForm.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminEvents from "./pages/admin/Events";
import AdminOrganizationDetail from "./pages/admin/OrganizationDetail.jsx";
import AdminOrganizations from "./pages/admin/Organizations";
import AdminStatistics from "./pages/admin/Statistics";
import AdminVolunteers from "./pages/admin/Volunteers";

import RequireAuth from "./components/RequireAuth.jsx";
import { useAuth } from "./context/useAuth.js";

export default function App() {
  const authData = useAuth();
  const auth = authData.auth;
  const user = auth ? auth.user : null;
  const role = user ? user.role : null;

  function getRedirectPath(r) {
    if (r === "MEMBER") return "/volunteer/dashboard";
    if (r === "ORG") return "/org/dashboard";
    if (r === "ADMIN") return "/admin/dashboard";
    return "/login";
  }

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={getRedirectPath(role)} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Volunteer */}
      <Route element={<RequireAuth allowedRoles={["MEMBER"]} />}>
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer/profile" element={<VolunteerProfile />} />
        <Route
          path="/volunteer/available-events"
          element={<AvailableEvents />}
        />
        <Route
          path="/volunteer/registered-events"
          element={<RegisteredEvents />}
        />
        <Route path="/volunteer/events/:id" element={<EventDetail />} />
        <Route
          path="/volunteer/notifications"
          element={<VolunteerNotifications />}
        />
      </Route>

      {/* Organization */}
      <Route element={<RequireAuth allowedRoles={["ORG"]} />}>
        <Route path="/org/dashboard" element={<OrgDashboard />} />
        <Route path="/org/settings" element={<OrgSettings />} />
        <Route path="/org/activities" element={<OrgActivities />} />
        <Route path="/org/volunteers" element={<OrgVolunteers />} />
        <Route path="/org/stats" element={<OrgStats />} />
        <Route path="/org/activities/create" element={<CreateActivity />} />
        <Route path="/org/activities/:id/edit" element={<EditActivity />} />
        <Route
          path="/org/activities/:id/participants"
          element={<ActivityParticipants />}
        />
      </Route>

      {/* Admin */}
      <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/volunteers" element={<AdminVolunteers />} />
        <Route path="/admin/organizations" element={<AdminOrganizations />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/statistics" element={<AdminStatistics />} />
        <Route
          path="/admin/organizations/add"
          element={<AddOrganizationForm />}
        />
        <Route
          path="/admin/organization/:id"
          element={<AdminOrganizationDetail />}
        />
      </Route>

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="text-center p-10">
            Bạn không có quyền truy cập trang này.
          </div>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
