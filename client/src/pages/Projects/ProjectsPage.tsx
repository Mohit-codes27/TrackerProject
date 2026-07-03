import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";

const TABS = ["Active", "Completed", "Archived"];

const categoryConfig: Record<string, { color: string; bg: string }> = {
  Frontend: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  Backend: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  FullStack: { color: "#7c6ff7", bg: "rgba(124,111,247,0.1)" },
};

const getEmptyForm = () => ({
  projectName: "",
  category: "FullStack",
  techStack: "",
  description: "",
  hoursLogged: "",
  loggedAt: new Date().toISOString().slice(0, 16),
});

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Active");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(getEmptyForm);
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["project-logs", page],
    queryFn: async () => {
      const res = await api.get(`/projects?page=${page}&limit=10`);
      return res.data ?? { logs: [], total: 0, pages: 1 };
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post("/projects", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-logs"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary-stats"] });
      setDrawerOpen(false);
      setForm(getEmptyForm());
      setFormError("");
      toast.success("Project log created successfully!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create log";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-logs"] });
      toast.success("Project log deleted.");
    },
    onError: () => toast.error("Failed to delete log."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({
      ...form,
      hoursLogged: Number(form.hoursLogged),
      loggedAt: new Date(form.loggedAt).toISOString(),
      techStack: form.techStack ? form.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  const logs = data?.logs ?? [];
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  // Group project hours by project name
  const projectGroups = (() => {
    const map: Record<string, { name: string; category: string; techStack: string[]; totalHours: number; entries: number; lastDate: string; description?: string }> = {};
    logs.forEach((log: any) => {
      if (!map[log.projectName]) {
        map[log.projectName] = {
          name: log.projectName,
          category: log.category,
          techStack: log.techStack ?? [],
          totalHours: 0,
          entries: 0,
          lastDate: log.loggedAt,
          description: log.description,
        };
      }
      map[log.projectName].totalHours += log.hoursLogged;
      map[log.projectName].entries += 1;
      if (new Date(log.loggedAt) > new Date(map[log.projectName].lastDate)) {
        map[log.projectName].lastDate = log.loggedAt;
      }
    });
    return Object.values(map);
  })();

  // Calculate total weekly hours
  const totalWeeklyHours = logs.reduce((acc: number, l: any) => acc + l.hoursLogged, 0);

  // Weekly mini bar chart
  const weeklyBars = (() => {
    const days: number[] = Array(5).fill(0);
    logs.forEach((l: any) => {
      const d = new Date(l.loggedAt).getDay();
      if (d >= 1 && d <= 5) days[d - 1] += l.hoursLogged;
    });
    return days;
  })();

  // Upcoming milestones (simulated from recent logs)
  const milestones = logs.slice(0, 3).map((l: any) => ({
    date: new Date(l.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    label: `${l.projectName} - ${l.description?.slice(0, 30) || l.category}`,
    upcoming: new Date(l.loggedAt) > new Date(Date.now() - 86400000),
  }));

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0b1120" }}>
      <div className="p-6 pb-10 flex flex-col gap-6 max-w-[1400px]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in pr-2">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold tracking-tight truncate" style={{ color: "#f1f5f9" }}>Project Logs</h1>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{ background: "#3b82f6", color: "white", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
          >
            <i className="ti ti-plus text-sm" />
            New Project
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 animate-fade-in overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all border"
              style={activeTab === tab
                ? { background: "#131c31", color: "white", borderColor: "#1e3050", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }
                : { background: "transparent", color: "#64748b", borderColor: "transparent" }
              }
            >
              {activeTab === tab && <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: "#3b82f6" }} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content: Cards + Sidebar */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {[0, 1].map((i) => <SkeletonCard key={i} className="h-48" />)}
            </div>
            <div className="flex flex-col gap-4">
              <SkeletonCard className="h-56" />
              <SkeletonCard className="h-36" />
            </div>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon="ti-folders"
            title="No project logs yet"
            subtitle="Start tracking your project work by logging your first session."
            actionLabel="New Project"
            onAction={() => setDrawerOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Project Cards */}
            <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
              {projectGroups.map((project, idx) => {
                const cfg = categoryConfig[project.category] ?? categoryConfig.FullStack;
                const progress = Math.min(100, Math.round((project.totalHours / 100) * 100));

                return (
                  <div
                    key={project.name}
                    className="glass-card p-6 opacity-0 animate-slide-up"
                    style={{ animationDelay: `${idx * 80 + 50}ms`, animationFillMode: "forwards" }}
                  >
                    {/* Card Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h3 className="text-[18px] font-semibold truncate" style={{ color: "#f1f5f9" }}>{project.name}</h3>
                        {project.description && (
                          <p className="text-[13px] mt-1 line-clamp-2" style={{ color: "#94a3b8" }}>{project.description}</p>
                        )}
                      </div>
                      <span
                        className="flex-shrink-0 text-[11px] px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                        {project.category}
                      </span>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-medium border"
                          style={{ background: "#0d1526", borderColor: "#1e3050", color: "#94a3b8" }}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-[11px] px-2.5 py-1 rounded-lg border"
                          style={{ background: "#0d1526", borderColor: "#1e3050", color: "#475569" }}>
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="rounded-xl px-4 py-3 border" style={{ background: "#0d1526", borderColor: "#1e3050" }}>
                        <div className="text-[11px] mb-1 font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Time Logged</div>
                        <div className="text-[18px] font-bold" style={{ color: "#f1f5f9" }}>{project.totalHours.toFixed(1)}h</div>
                      </div>
                      <div className="rounded-xl px-4 py-3 border" style={{ background: "#0d1526", borderColor: "#1e3050" }}>
                        <div className="text-[11px] mb-1 font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Sessions</div>
                        <div className="text-[18px] font-bold" style={{ color: "#f1f5f9" }}>{project.entries}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-medium" style={{ color: "#94a3b8" }}>Overall Progress</span>
                      <span className="text-[13px] font-bold" style={{ color: "#e2e8f0" }}>{progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#0d1526", border: "1px solid #1e3050" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Raw logs table */}
              <div className="glass-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid #1e3050" }}>
                  <span className="text-[15px] font-semibold" style={{ color: "#e2e8f0" }}>All Log Entries</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1e3050" }}>
                        {["Project", "Category", "Tech Stack", "Hours", "Date"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>
                            {h}
                          </th>
                        ))}
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any) => {
                        const cfg = categoryConfig[log.category] ?? categoryConfig.FullStack;
                        return (
                          <tr key={log.id} className="transition-colors group hover:bg-[rgba(59,130,246,0.03)]" style={{ borderBottom: "1px solid #182840" }}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                                <span className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{log.projectName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-lg font-medium border"
                                style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}30` }}>
                                {log.category}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1.5">
                                {(log.techStack ?? []).slice(0, 3).map((t: string) => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md border"
                                    style={{ background: "#0d1526", borderColor: "#1e3050", color: "#94a3b8" }}>
                                    {t}
                                  </span>
                                ))}
                                {(log.techStack ?? []).length > 3 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md border"
                                    style={{ background: "#0d1526", borderColor: "#1e3050", color: "#475569" }}>
                                    +{(log.techStack.length - 3)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{log.hoursLogged}h</span>
                            </td>
                            <td className="px-5 py-3.5 text-[12px]" style={{ color: "#475569" }}>
                              {new Date(log.loggedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button onClick={() => deleteMutation.mutate(log.id)}
                                className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#475569" }}>
                                <i className="ti ti-trash text-sm hover:text-[#ef4444]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-[11px]" style={{ color: "#475569" }}>
                      Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30"
                        style={{ borderColor: "#1e3050", color: "#475569" }}>
                        <i className="ti ti-chevron-left text-sm" />
                      </button>
                      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg border text-[12px] transition-all"
                          style={p === page ? { background: "#3b82f6", borderColor: "#3b82f6", color: "white" } : { borderColor: "#1e3050", color: "#475569" }}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30"
                        style={{ borderColor: "#1e3050", color: "#475569" }}>
                        <i className="ti ti-chevron-right text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* Upcoming Milestones */}
              <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[15px] font-semibold" style={{ color: "#e2e8f0" }}>Upcoming Milestones</span>
                  <button className="transition-colors hover:text-white" style={{ color: "#475569" }}>
                    <i className="ti ti-dots text-base" />
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {milestones.length > 0 ? milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 border-2"
                          style={{ background: m.upcoming ? "#3b82f6" : "transparent", borderColor: m.upcoming ? "#3b82f6" : "#1e3050" }} />
                        {i < milestones.length - 1 && (
                          <div className="w-px h-8 mt-1" style={{ background: "#1e3050" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium" style={{ color: "#94a3b8" }}>{m.date}</div>
                        <div className="text-[13px] mt-0.5 leading-snug truncate" style={{ color: "#e2e8f0" }}>{m.label}</div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-[13px]" style={{ color: "#475569" }}>No milestones yet.</p>
                  )}
                </div>
              </div>

              {/* Weekly Logged */}
              <div className="glass-card p-6 opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,111,247,0.12)" }}>
                    <i className="ti ti-clock-hour-4 text-[22px]" style={{ color: "#7c6ff7" }} />
                  </div>
                  <div>
                    <div className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#94a3b8" }}>Weekly Logged</div>
                    <div className="text-[26px] font-bold leading-none mt-1" style={{ color: "#f1f5f9" }}>
                      {totalWeeklyHours.toFixed(1)}<span className="text-[16px] font-medium ml-1" style={{ color: "#475569" }}>h</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-16 w-full">
                  {weeklyBars.map((h, i) => (
                    <div key={i} className="flex-1 rounded-md transition-all"
                      style={{
                        height: `${Math.max(15, (h / Math.max(...weeklyBars, 1)) * 100)}%`,
                        background: h > 0 ? "#7c6ff7" : "#1e3050",
                        opacity: h > 0 ? 0.5 + (h / Math.max(...weeklyBars, 1)) * 0.5 : 1,
                      }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["M", "T", "W", "T", "F"].map((d) => (
                    <span key={d} className="text-[10px] flex-1 text-center font-medium" style={{ color: "#475569" }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-[400px] flex flex-col h-full border-l"
            style={{ background: "#0f172a", borderColor: "#1e3050", animation: "slideInRight 0.3s ease-out" }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1e3050" }}>
              <div>
                <span className="text-[16px] font-semibold" style={{ color: "#f1f5f9" }}>New Project Log</span>
                <p className="text-[12px] mt-0.5" style={{ color: "#475569" }}>Track your project progress</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#131c31]" style={{ color: "#475569" }}>
                <i className="ti ti-x text-base hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {formError && (
                <div className="px-3 py-2.5 rounded-xl text-[12px] flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <i className="ti ti-alert-circle text-sm" />{formError}
                </div>
              )}

              <div>
                <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Project Name</label>
                <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} required
                  className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                  style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }} />
              </div>

              <div>
                <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                  style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}>
                  {["Frontend", "Backend", "FullStack"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Tech Stack (comma separated)</label>
                <input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                  style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }} />
              </div>

              <div>
                <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Description (optional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors resize-none"
                  style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Hours Logged</label>
                  <input type="number" value={form.hoursLogged} onChange={(e) => setForm({ ...form, hoursLogged: e.target.value })} required min={0.5} step={0.5}
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }} />
                </div>
                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Logged At</label>
                  <input type="datetime-local" value={form.loggedAt} onChange={(e) => setForm({ ...form, loggedAt: e.target.value })} required
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }} />
                </div>
              </div>

              <div className="px-0 py-4 border-t flex gap-3 mt-auto" style={{ borderColor: "#1e3050" }}>
                <button type="button" onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] transition-all"
                  style={{ borderColor: "#1e3050", color: "#94a3b8" }}>Cancel</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-medium transition-all disabled:opacity-50"
                  style={{ background: "#3b82f6" }}>
                  {createMutation.isPending ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;