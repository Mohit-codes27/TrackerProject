import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "ti-layout-dashboard" },
  { to: "/coding", label: "Coding Logs", icon: "ti-code" },
  { to: "/projects", label: "Projects", icon: "ti-folders" },
  { to: "/analytics", label: "Analytics", icon: "ti-chart-bar" },
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
    <div className="flex h-screen bg-[#0d0d0f] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[190px] bg-[#111114] border-r border-[#2a2a2e] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-[#2a2a2e]">
          <div className="w-7 h-7 bg-[#7F77DD] rounded-md flex items-center justify-center">
            <i className="ti ti-terminal-2 text-white text-sm" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#e8e8ec] leading-none">DevTrack</div>
            <div className="text-[10px] text-[#555560] mt-0.5">Technical Operator</div>
          </div>
        </div>

        {/* New Log button */}
        <div className="px-3 py-3 border-b border-[#2a2a2e]">
          <NavLink
            to="/coding"
            className="flex items-center justify-center gap-2 w-full py-1.5 rounded-md bg-[#1e1e28] border border-[#3a3a4e] text-[#a09df5] text-xs font-medium hover:bg-[#252535] transition-colors"
          >
            <i className="ti ti-plus text-sm" />
            New Log
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#1e1e28] text-[#a09df5]"
                    : "text-[#666672] hover:text-[#c8c8d4] hover:bg-[#18181c]"
                }`
              }
            >
              <i className={`ti ${item.icon} text-base`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-[#2a2a2e] flex flex-col gap-0.5">
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[#666672] hover:text-[#c8c8d4] hover:bg-[#18181c] transition-colors w-full text-left">
            <i className="ti ti-settings text-base" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[#666672] hover:text-red-400 hover:bg-[#18181c] transition-colors w-full text-left"
          >
            <i className="ti ti-logout text-base" />
            Logout
          </button>
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-[#1e1e28] border border-[#3a3a4e] flex items-center justify-center text-[11px] font-medium text-[#a09df5]">
              {initials}
            </div>
            <span className="text-[12px] text-[#555560] truncate">{user?.name}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;