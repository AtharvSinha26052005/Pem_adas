import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Project } from "../types";
import {
  FolderPlus,
  Search,
  Filter,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  ChevronDown,
  AlertTriangle,
  User,
  Car,
  Compass,
  Brain,
  Sparkles,
} from "lucide-react";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created-desc");

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newOdd, setNewOdd] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Project Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editOdd, setEditOdd] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // AI Assessment Modal State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");
  const [aiProvider, setAiProvider] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProjectName, setAiProjectName] = useState("");

  const openAiAssessment = async (project: Project) => {
    setAiProjectName(project.name);
    setAiReport("");
    setAiProvider("");
    setAiLoading(true);
    setIsAiOpen(true);
    try {
      const res = await api.getAiAssessment(project.id);
      setAiReport(res.assessment);
      setAiProvider(res.provider);
    } catch (err: any) {
      setAiReport("⚠️ Failed to generate safety report. " + (err.message || ""));
    } finally {
      setAiLoading(false);
    }
  };

  // Load Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handlers for Create Project
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPlatform || !newOdd) {
      setError("Please fill in all creation fields.");
      return;
    }
    setCreateSubmitting(true);
    try {
      await api.createProject(newName, newPlatform, newOdd);
      setIsCreateOpen(false);
      setNewName("");
      setNewPlatform("");
      setNewOdd("");
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Project creation failed.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handlers for Edit Project
  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setEditName(project.name);
    setEditPlatform(project.vehicle_platform);
    setEditOdd(project.odd_type);
    setEditStatus(project.status);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setEditSubmitting(true);
    try {
      const updates: any = {};
      const role = user?.role_name;

      if (role === "Admin") {
        updates.name = editName;
        updates.vehicle_platform = editPlatform;
        updates.odd_type = editOdd;
        updates.status = editStatus;
      } else if (role === "Validation Engineer") {
        updates.name = editName;
        updates.vehicle_platform = editPlatform;
        updates.odd_type = editOdd;
      } else if (role === "Reviewer") {
        updates.status = editStatus;
      }

      await api.updateProject(selectedProject.id, updates);
      setIsEditOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Project update failed.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.creator_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesPlatform = platformFilter === "All" || p.vehicle_platform === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "id-asc":
        return a.id - b.id;
      case "id-desc":
        return b.id - a.id;
      case "created-asc":
        return a.id - b.id;
      case "created-desc":
      default:
        return b.id - a.id;
    }
  });

  const uniquePlatforms = Array.from(new Set(projects.map((p) => p.vehicle_platform)));

  // Status Badge styles helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-3 h-3 shrink-0" />
            <span>Approved</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <XCircle className="w-3 h-3 shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case "In Review":
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3 shrink-0" />
            <span>In Review</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400">
            <Layers className="w-3 h-3 shrink-0" />
            <span>Draft</span>
          </span>
        );
    }
  };

  // Determine if a user can edit a project
  const canEditProject = (project: Project): boolean => {
    if (!user) return false;
    const role = user.role_name;

    if (role === "Admin") return true;
    if (role === "Reviewer") return true; // Reviewer can always update status
    if (role === "Validation Engineer") {
      // Engineer can only edit their own projects
      return project.created_by === user.id;
    }
    return false; // Viewer cannot edit
  };

  // Helper text on field locks based on role in edit modal
  const getFieldLockWarning = () => {
    if (user?.role_name === "Validation Engineer") {
      return "Safety Reviewers manage project statuses. Status dropdown is locked for Validation Engineers.";
    }
    if (user?.role_name === "Reviewer") {
      return "Only creators can edit project configurations. Text fields are locked for Safety Reviewers.";
    }
    return "";
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight">
            Validation Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure vehicle sensor profiles, ODD constraints, and safety workflows.
          </p>
        </div>

        {/* Create Project Button (Admin and Validation Engineer only) */}
        {(user?.role_name === "Admin" || user?.role_name === "Validation Engineer") && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Global Error Banner */}
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

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/30 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name or engineer..."
            className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-300"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-300 outline-none transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Platform filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-300 outline-none transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="All">All Platforms</option>
            {uniquePlatforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-300 outline-none transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="created-desc">Last Created (Newest)</option>
            <option value="created-asc">First Created (Oldest)</option>
            <option value="id-asc">ID (Low → High)</option>
            <option value="id-desc">ID (High → Low)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading configurations...</p>
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-950/50 flex items-center justify-center border border-slate-800 text-slate-600 mb-4">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-300">No Projects Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Try adjusting your query or filter parameters, or create a new validation record above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-5 font-heading">Project Profile</th>
                  <th className="p-5 font-heading">Sensor Platform</th>
                  <th className="p-5 font-heading">ODD Profile</th>
                  <th className="p-5 font-heading">Workflow Status</th>
                  <th className="p-5 font-heading">Created By</th>
                  <th className="p-5 font-heading text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {sortedProjects.map((p) => {
                  const editable = canEditProject(p);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/20 transition-colors group text-sm text-slate-300"
                    >
                      <td className="p-5 font-medium text-slate-200">
                        <div className="font-semibold text-base font-heading tracking-tight">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {p.id}</div>
                      </td>
                      <td className="p-5">
                        <span className="flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{p.vehicle_platform}</span>
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{p.odd_type}</span>
                        </span>
                      </td>
                      <td className="p-5">{getStatusBadge(p.status)}</td>
                      <td className="p-5">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{p.creator_name}</span>
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAiAssessment(p)}
                            className="px-3 py-2 text-xs font-bold rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 transition-all duration-300 flex items-center gap-1.5 shadow-sm"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>AI Report</span>
                          </button>
                          {editable ? (
                            <button
                              onClick={() => openEditModal(p)}
                              className="px-4 py-2 text-xs font-bold rounded-xl border border-purple-800/40 bg-purple-950/10 hover:bg-purple-950/30 text-purple-300 transition-all duration-300"
                            >
                              Edit
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-slate-600 px-3 py-2 border border-slate-900 bg-slate-950/10 rounded-xl select-none">
                              Read Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              Create Validation Project
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Create a new ADAS configuration record. The record will default to <strong>Draft</strong> status.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. AEB Urban Pedestrian"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vehicle Platform
                </label>
                <input
                  type="text"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="e.g. SUV-ModelY"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ODD Type
                </label>
                <input
                  type="text"
                  value={newOdd}
                  onChange={(e) => setNewOdd(e.target.value)}
                  placeholder="e.g. Highway Night Rain"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 transition-colors"
                >
                  {createSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              Edit Project Settings
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Modify the configuration or advance the workflow state. RBAC locks are applied based on your role.
            </p>

            {/* Field Lock Warning Alert */}
            {getFieldLockWarning() && (
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-left">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-amber-300 leading-relaxed">
                  {getFieldLockWarning()}
                </p>
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              {/* Text fields editable only by Admin and Validation Engineer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={user?.role_name === "Reviewer"}
                  required
                  className="w-full bg-slate-950/60 disabled:bg-slate-950/20 disabled:text-slate-500 disabled:border-slate-800/40 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vehicle Platform
                </label>
                <input
                  type="text"
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                  disabled={user?.role_name === "Reviewer"}
                  required
                  className="w-full bg-slate-950/60 disabled:bg-slate-950/20 disabled:text-slate-500 disabled:border-slate-800/40 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ODD Type
                </label>
                <input
                  type="text"
                  value={editOdd}
                  onChange={(e) => setEditOdd(e.target.value)}
                  disabled={user?.role_name === "Reviewer"}
                  required
                  className="w-full bg-slate-950/60 disabled:bg-slate-950/20 disabled:text-slate-500 disabled:border-slate-800/40 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              {/* Status field editable only by Admin and Reviewer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Workflow Status
                </label>
                <div className="relative">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={user?.role_name === "Validation Engineer"}
                    className="w-full bg-slate-950/60 disabled:bg-slate-950/20 disabled:text-slate-500 disabled:border-slate-800/40 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 transition-colors"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI ASSESSMENT MODAL */}
      {isAiOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Visual glow background inside modal */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-white flex items-center gap-1.5">
                  <span>AI Copilot Safety Analysis</span>
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                </h3>
                <p className="text-xs text-slate-400">
                  Target Config: <strong className="text-slate-300 font-semibold">{aiProjectName}</strong>
                </p>
              </div>
            </div>

            {/* Assessment Content Box */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 min-h-[300px] max-h-[450px] overflow-y-auto font-sans leading-relaxed text-sm text-slate-300 shadow-inner">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin relative z-10" />
                    <Brain className="w-5 h-5 text-indigo-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">
                    Synthesizing neural safeties...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 whitespace-pre-wrap leading-relaxed font-medium">
                  {aiReport}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-800/80 mt-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Model Engine:</span>
                <span className="text-indigo-400">{aiProvider || "Waiting..."}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
