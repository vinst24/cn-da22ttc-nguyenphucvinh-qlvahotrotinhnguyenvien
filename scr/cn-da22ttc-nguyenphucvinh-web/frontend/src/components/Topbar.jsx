import { Bell, LogOut, Search, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Topbar(props) {
  const sidebarWidth = props.sidebarWidth || "16rem";
  const userProp = props.user;

  const authCtx = useAuth();
  const auth = authCtx.auth;
  const logout = authCtx.logout;

  var user = null;
  if (auth && auth.user) {
    user = auth.user;
  } else if (userProp) {
    user = userProp;
  }

  var onSearch = props.onSearch;
  var [keyword, setKeyword] = useState("");
  function handleChange(e) {
    var value = e.target.value;
    setKeyword(value);

    if (onSearch) {
      onSearch(value);
    }
  }

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* =========================
     Close menu on outside click
  ========================= */
  useEffect(function() {
    const handleClickOutside = function(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return function() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================
     Actions
  ========================= */
  const handleLogout = async function() {
    setMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSettings = function() {
    setMenuOpen(false);

    var role = "";
    if (user && user.role) {
      role = String(user.role).toUpperCase();
    }

    if (role === "MEMBER") return navigate("/volunteer/profile");
    if (role === "ORG") return navigate("/org/settings");
    if (role === "ADMIN") return navigate("/admin/settings");

    navigate("/");
  };

  var avatar = user && user.avatar ? user.avatar : "https://i.pravatar.cc/40";

  return (
    <header
      className="fixed top-0 z-20 h-16 bg-white shadow-sm
        flex items-center justify-between px-4 md:px-6 transition-all"
      style={{
        left: sidebarWidth,
        width: "calc(100% - " + sidebarWidth + ")"
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Search (hide input on small screens) */}
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={keyword}
          onChange={handleChange}
          placeholder="Tìm kiếm..."
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <img
            src={avatar}
            alt="avatar"
            className="w-9 h-9 rounded-full border cursor-pointer"
            onClick={function() {
              setMenuOpen(!menuOpen);
            }}
          />

          {menuOpen &&
            <div className="absolute right-0 mt-2 w-48 bg-white
              border rounded-lg shadow-md overflow-hidden">
              <button
                onClick={handleSettings}
                className="flex items-center gap-2 w-full
                  px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                Cài đặt tài khoản
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full
                  px-4 py-2 text-sm hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>}
        </div>
      </div>
    </header>
  );
}
