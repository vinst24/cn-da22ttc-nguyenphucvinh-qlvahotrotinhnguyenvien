import { Home, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar(props) {
  var items = props.items || [];
  var open = props.open;
  var onClose = props.onClose;

  var navigate = useNavigate();
  var location = useLocation();

  /* =========================
     ROLE & ROUTES
  ========================= */
  function getRoleFromPath(pathname) {
    if (pathname.indexOf("/admin") === 0) return "admin";
    if (pathname.indexOf("/org") === 0) return "org";
    if (pathname.indexOf("/volunteer") === 0) return "volunteer";
    return null;
  }

  function getHomeRouteByRole(role) {
    if (role === "admin") return "/admin/dashboard";
    if (role === "org") return "/org/dashboard";
    if (role === "volunteer") return "/volunteer/dashboard";
    return "/";
  }

  var role = getRoleFromPath(location.pathname);
  var homeRoute = getHomeRouteByRole(role);

  function go(route) {
    if (route) navigate(route);
    if (onClose) onClose();
  }

  /* =========================
     ACTIVE CHECK
  ========================= */
  function isActiveRoute(route) {
    if (!route) return false;
    return location.pathname === route ||
      location.pathname.indexOf(route + "/") === 0;
  }

  var homeActive = isActiveRoute(homeRoute);

  /* =========================
     RENDER
  ========================= */
  return (
    <div>
      {/* Overlay – Mobile */}
      {open
        ? <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={onClose}
          />
        : null}

      <aside
        className={
          "fixed md:sticky md:top-0 z-50 top-0 left-0 h-screen w-64 " +
          "bg-indigo-700 text-white shadow-lg " +
          "transform transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="h-full flex flex-col p-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Menu</h2>
              <p className="text-xs text-indigo-200">
                Điều hướng nhanh
              </p>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-1 rounded hover:bg-indigo-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* HOME */}
          <button
            onClick={function() {
              go(homeRoute);
            }}
            className={
              "mb-3 flex items-center gap-3 px-3 py-2 rounded transition " +
              (homeActive
                ? "bg-indigo-900 font-semibold border-l-4 border-indigo-300"
                : "hover:bg-indigo-800")
            }
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Trang chủ</span>
          </button>

          <hr className="border-indigo-600 my-3" />

          {/* MENU */}
          <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
            {items.map(function(item, index) {
              var Icon = item.icon;
              var active = isActiveRoute(item.route);

              return (
                <li
                  key={item.route || index}
                  onClick={function() {
                    go(item.route);
                  }}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition " +
                    (active
                      ? "bg-indigo-900 font-semibold border-l-4 border-indigo-300"
                      : "hover:bg-indigo-800")
                  }
                >
                  {typeof Icon === "function"
                    ? <Icon className="w-5 h-5 shrink-0 text-indigo-100" />
                    : null}

                  <span className="truncate">
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* FOOTER */}
          <div className="pt-3 text-xs text-indigo-200">
            © {new Date().getFullYear()} Volunteer System
          </div>
        </div>
      </aside>
    </div>
  );
}
