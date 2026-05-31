import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Project } from "../types";
import {
  Shield,
  Layers,
  FolderOpen,
  ClipboardCheck,
  Clock,
  Car,
  Compass,
} from "lucide-react";

export default function Dashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects for stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Stats calculation
  const totalProjects = projects.length;
  const draftCount = projects.filter((p) => p.status === "Draft").length;
  const reviewCount = projects.filter((p) => p.status === "In Review").length;
  const approvedCount = projects.filter((p) => p.status === "Approved").length;

  const platforms = Array.from(new Set(projects.map((p) => p.vehicle_platform)));
  const oddTypes = Array.from(new Set(projects.map((p) => p.odd_type)));

  // Mock roles summary for the assignment requirements visualization
  const roleRules = [
    {
      role: "Admin",
      desc: "Full administrative access. Can modify user roles and update any field on any validation project.",
      color: "from-red-500 to-rose-600",
      textColor: "text-rose-400",
    },
    {
      role: "Validation Engineer",
      desc: "Creator of validation projects. Can create new projects and edit details (name, platform, ODD) on their own projects. Cannot change statuses.",
      color: "from-blue-500 to-indigo-600",
      textColor: "text-indigo-400",
    },
    {
      role: "Reviewer",
      desc: "QA/Safety Reviewer. Can only change project status (Draft, In Review, Approved, Rejected) to advance workflow. Cannot edit text details.",
      color: "from-amber-500 to-yellow-600",
      textColor: "text-amber-400",
    },
    {
      role: "Viewer",
      desc: "Read-only access. Can inspect all validation projects and metrics across all vehicle platforms, but cannot create or modify any data.",
      color: "from-slate-500 to-slate-600",
      textColor: "text-slate-400",
    },
  ];

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/40">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="text-purple-400 font-semibold">{user?.name}</span> with{" "}
            <span className="text-indigo-400 font-semibold">{user?.role_name}</span> authority.
          </p>
        </div>
        <button
          onClick={() => onNavigate("projects")}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Launch Workspace</span>
        </button>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total projects */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-purple-950/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Projects
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-heading">
                {loading ? "..." : totalProjects}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">
            Active ADAS configurations in pipeline
          </div>
        </div>

        {/* Draft count */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/40">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Draft Status
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-heading">
                {loading ? "..." : draftCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">
            Awaiting engineering modification
          </div>
        </div>

        {/* In Review count */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-amber-950/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Under Review
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-heading">
                {loading ? "..." : reviewCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">
            Pending safety board verification
          </div>
        </div>

        {/* Approved count */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-emerald-950/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Approved
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-heading">
                {loading ? "..." : approvedCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">
            Validated configurations ready for release
          </div>
        </div>
      </div>

      {/* Dynamic parameters and platform overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles and ODD distribution */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl lg:col-span-1 space-y-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/40">
          <h3 className="text-lg font-bold font-heading text-white">
            Operational Boundaries
          </h3>
          
          {/* Platforms */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Car className="w-4 h-4 text-purple-400" />
              <span>Vehicle Platforms ({platforms.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-sm text-slate-600">Loading...</span>
              ) : platforms.length === 0 ? (
                <span className="text-xs font-medium text-slate-500">No platforms active</span>
              ) : (
                platforms.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-300"
                  >
                    {p}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ODD Types */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>ODD Types ({oddTypes.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-sm text-slate-600">Loading...</span>
              ) : oddTypes.length === 0 ? (
                <span className="text-xs font-medium text-slate-500">No ODDs active</span>
              ) : (
                oddTypes.map((o) => (
                  <span
                    key={o}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-300"
                  >
                    {o}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Role-Based Access Matrix */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl lg:col-span-2 space-y-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/40">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold font-heading text-white">
              Role-Based Access Matrix (RBAC)
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform enforces strict safety guardrails. Each role has specialized permissions to maintain separation of duties:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {roleRules.map((r) => (
              <div
                key={r.role}
                className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-lg hover:shadow-slate-950/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${r.color} shadow-sm`} />
                  <span className={`text-xs font-bold font-heading uppercase tracking-wider ${r.textColor}`}>
                    {r.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
