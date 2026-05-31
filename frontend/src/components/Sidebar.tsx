import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  LogOut,
  Cpu,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderGit2 },
  ];

  if (user.role_name === "Admin") {
    menuItems.push({ id: "users", label: "Users & Roles", icon: Users });
  }

  return (
    <aside
      className={`w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between h-screen shrink-0 fixed top-0 z-30 transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Upper Section */}
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
              ADAS Core
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">
              Validation Platform
            </p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-950/40 to-indigo-950/40 text-purple-300 border border-purple-800/50 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-purple-400" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>

                {/* Left Active Glow bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-md shadow-lg shadow-purple-500/50" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/40 border border-slate-800/40 rounded-xl mb-3">
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 uppercase shadow-inner border border-slate-700/30">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate font-heading">
              {user.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 text-slate-400">
              {user.role_name === "Admin" && (
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                {user.role_name}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 border border-rose-950/30 bg-rose-950/10 hover:bg-rose-950/30 hover:border-rose-800/40 transition-all duration-300"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
