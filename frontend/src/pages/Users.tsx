import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { User } from "../types";
import {
  AlertTriangle,
  ChevronDown,
  Info,
} from "lucide-react";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: number, newRoleName: string) => {
    setUpdatingId(targetUserId);
    setError(null);
    try {
      await api.updateUserRole(targetUserId, newRoleName);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            Admin
          </span>
        );
      case "Validation Engineer":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Engineer
          </span>
        );
      case "Reviewer":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            Reviewer
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400">
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight">
            User Access Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            As an Administrator, you can provision users and change role boundaries instantly.
          </p>
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-blue-300 leading-relaxed">
            Role updates take effect immediately for the target user. To avoid lockout scenarios, you cannot change your own Administrator role.
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-rose-300 truncate">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold text-rose-400 hover:text-rose-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Fetching active users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-5 font-heading">User Profile</th>
                  <th className="p-5 font-heading">Email Address</th>
                  <th className="p-5 font-heading">System Role</th>
                  <th className="p-5 font-heading text-right">Access Provisioning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/20 transition-colors group text-sm text-slate-300"
                    >
                      <td className="p-5 font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 uppercase shadow-inner border border-slate-700/30">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-base font-heading tracking-tight flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-md border border-purple-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">UID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-400 font-medium">{u.email}</td>
                      <td className="p-5">{getRoleBadge(u.role_name)}</td>
                      <td className="p-5 text-right">
                        {isSelf ? (
                          <span className="text-xs font-semibold text-slate-500 px-4 py-2 border border-slate-900 bg-slate-950/20 rounded-xl select-none inline-block">
                            Role Locked
                          </span>
                        ) : (
                          <div className="relative inline-block w-48 text-left">
                            <select
                              value={u.role_name}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={isUpdating}
                              className="w-full bg-slate-950/60 disabled:opacity-50 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-300 outline-none transition-all duration-300 appearance-none cursor-pointer"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Validation Engineer">Validation Engineer</option>
                              <option value="Reviewer">Reviewer</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
