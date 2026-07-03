import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ToastContainer from "../components/ui/Toast";

const navItems = [
  { to: "/", label: "Dashboard", icon: "ti-smart-home" },
  { to: "/coding", label: "Coding Logs", icon: "ti-layout-grid" },
  { to: "/projects", label: "Projects", icon: "ti-folders" },
  { to: "/analytics", label: "Analytics", icon: "ti-chart-dots-3" },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name?.slice(0, 1).toUpperCase() ?? "D";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0b1120" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0"
        style={{
          width: 220,
          background: "#0f172a",
          borderRight: "1px solid #1e3050",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #1e3050" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #7c6ff7)" }}
          >
            <i className="ti ti-rocket text-white text-lg" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[14px] font-semibold text-[#f1f5f9] leading-none truncate">
              DevTrack
            </div>
            <div className="text-[10px] text-[#475569] mt-0.5">Tracker</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-[#131c31]"
                    : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#131c31]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: "#3b82f6" }}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "" : "group-hover:bg-[#1a2540]"
                    }`}
                    style={isActive ? { background: "rgba(59, 130, 246, 0.15)" } : {}}
                  >
                    <i
                      className={`ti ${item.icon} text-[17px]`}
                      style={isActive ? { color: "#3b82f6" } : {}}
                    />
                  </div>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 flex flex-col gap-1" style={{ borderTop: "1px solid #1e3050" }}>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#64748b] hover:text-[#94a3b8] hover:bg-[#131c31] transition-all w-full text-left">
            <i className="ti ti-sun text-[17px]" />
            <span>Theme</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#64748b] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.06)] transition-all w-full text-left"
          >
            <i className="ti ti-logout text-[17px]" />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #7c6ff7)", color: "white" }}
            >
              {initials}
            </div>
            <span className="text-[12px] text-[#64748b] truncate">{user?.name}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header bar */}
        <header
          className="flex items-center justify-end px-6 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #1e3050" }}
        >
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748b] hover:text-[#94a3b8] hover:bg-[#131c31] transition-all">
              <i className="ti ti-bell text-lg" />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748b] hover:text-[#94a3b8] hover:bg-[#131c31] transition-all">
              <i className="ti ti-settings text-lg" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ml-1"
              style={{ background: "linear-gradient(135deg, #3b82f6, #7c6ff7)", color: "white" }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content — flex-1 + overflow hidden to contain pages */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default AppLayout;