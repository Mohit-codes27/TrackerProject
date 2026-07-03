import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard, SkeletonTable } from "../../components/ui/Skeleton";

const PLATFORMS = ["All", "LeetCode", "GFG", "Codeforces"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const difficultyColor = (d: string) => {
  if (d === "Easy") return "#10b981";
  if (d === "Medium") return "#f59e0b";
  return "#ef4444";
};

const platformConfig: Record<string, { color: string; bg: string }> = {
  LeetCode: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  GFG: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  Codeforces: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  HackerRank: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

const emptyForm = {
  platform: "LeetCode",
  problemName: "",
  problemLink: "",
  difficulty: "Easy",
  topic: "",
  description: "",
  timeSpentMinutes: "",
  attempts: "1",
  solvedAt: new Date().toISOString().slice(0, 16),
};

const CodingPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["coding-logs", page, platform, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(platform !== "All" && { platform }),
        ...(difficulty !== "All" && { difficulty }),
      });
      const res = await api.get(`/coding?${params}`);
      return res.data.data ?? { logs: [], total: 0, pages: 1 };
    },
  });

  // Streak & stats
  const { data: streakData } = useQuery({
    queryKey: ["current-streak"],
    queryFn: async () => {
      const res = await api.get("/analytics/streak");
      return res.data.data ?? { current: 0, best: 0 };
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post("/coding", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coding-logs"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary-stats"] });
      queryClient.invalidateQueries({ queryKey: ["topic-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-trend"] });
      queryClient.invalidateQueries({ queryKey: ["current-streak"] });
      setDrawerOpen(false);
      setForm(emptyForm);
      setFormError("");
      toast.success("Coding log created successfully!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create log";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coding/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coding-logs"] });
      toast.success("Log deleted successfully.");
    },
    onError: () => toast.error("Failed to delete log."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({
      ...form,
      timeSpentMinutes: Number(form.timeSpentMinutes),
      attempts: Number(form.attempts),
      solvedAt: new Date(form.solvedAt).toISOString(),
      problemLink: form.problemLink || undefined,
      description: form.description || undefined,
    });
  };

  const logs = data?.logs ?? [];
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  const filteredLogs = searchQuery
    ? logs.filter((l: any) =>
        l.problemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  // Heatmap — last 7 days
  const heatmapDays = (() => {
    const days: { label: string; count: number }[] = [];
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = logs.filter((l: any) => new Date(l.solvedAt).toISOString().slice(0, 10) === dateStr).length;
      days.push({ label: dayLabels[(d.getDay() + 6) % 7], count });
    }
    return days;
  })();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    }
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0b1120" }}>
      <div className="p-6 pb-10 flex flex-col gap-6 max-w-[1400px]">

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in pr-2">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold tracking-tight truncate" style={{ color: "#f1f5f9" }}>Coding Logs</h1>
            <p className="text-[14px] mt-1 truncate" style={{ color: "#475569" }}>
              Track your problem-solving journey and algorithmic mastery.
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{ background: "#3b82f6", color: "white", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
          >
            <i className="ti ti-plus text-sm" />
            Log Problem
          </button>
        </div>

        {/* Stat Cards Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Problems Solved */}
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "50ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Problems Solved</span>
                <i className="ti ti-sigma text-lg" style={{ color: "#64748b" }} />
              </div>
              <div className="text-[36px] font-bold leading-none tracking-tight" style={{ color: "#f1f5f9" }}>{total}</div>
              <div className="mt-3 h-[3px] w-20 rounded-full" style={{ background: "#3b82f6", opacity: 0.7 }} />
            </div>

            {/* Current Streak */}
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Current Streak</span>
                <i className="ti ti-flame text-lg" style={{ color: "#f59e0b" }} />
              </div>
              <div className="text-[36px] font-bold leading-none tracking-tight" style={{ color: "#f59e0b" }}>
                {streakData?.current ?? 0} <span className="text-[16px] font-medium" style={{ color: "#64748b" }}>Days</span>
              </div>
              <div className="mt-3 h-[3px] w-20 rounded-full" style={{ background: "#f59e0b", opacity: 0.7 }} />
            </div>

            {/* Activity Heatmap */}
            <div className="glass-card p-5 opacity-0 animate-slide-up flex flex-col justify-between" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Activity Heatmap</span>
                <span className="text-[11px]" style={{ color: "#475569" }}>Last 7 Days</span>
              </div>
              <div className="flex items-end gap-2 mt-2 h-[45px]">
                {heatmapDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <div
                      className="w-full rounded-[4px] transition-all"
                      style={{
                        height: Math.max(8, day.count * 12),
                        maxHeight: "30px",
                        background: day.count > 0 ? "#3b82f6" : "#1e3050",
                        opacity: day.count > 0 ? 0.4 + day.count * 0.2 : 1,
                      }}
                    />
                    <span className="text-[10px] font-medium" style={{ color: i === heatmapDays.length - 1 ? "#3b82f6" : "#475569" }}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Logs Table */}
        {isLoading ? (
          <SkeletonTable rows={6} columns={5} />
        ) : (
          <div className="glass-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            {/* Table Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between px-5 py-4 gap-4" style={{ borderBottom: "1px solid #1e3050" }}>
              <span className="text-[16px] font-semibold" style={{ color: "#e2e8f0" }}>Recent Logs</span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#475569" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="pl-9 pr-3 py-2 rounded-xl text-[12px] transition-colors w-[200px]"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#e2e8f0" }}
                  />
                </div>
                {/* Filter pills - Platforms */}
                <div className="flex items-center gap-1 ml-1">
                  {PLATFORMS.slice(1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPlatform(platform === p ? "All" : p); setPage(1); }}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg transition-all border"
                      style={platform === p
                        ? { borderColor: "#3b82f6", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }
                        : { borderColor: "#1e3050", background: "transparent", color: "#64748b" }
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {/* Filter pills - Difficulties */}
                <div className="flex items-center gap-1 ml-1">
                  {DIFFICULTIES.slice(1).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(difficulty === d ? "All" : d); setPage(1); }}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg transition-all border"
                      style={difficulty === d
                        ? { borderColor: difficultyColor(d), background: `${difficultyColor(d)}15`, color: difficultyColor(d) }
                        : { borderColor: "#1e3050", background: "transparent", color: "#64748b" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <EmptyState
                icon="ti-code"
                title="No coding logs found"
                subtitle="Start tracking your problem-solving journey by logging your first problem."
                actionLabel="Log Problem"
                onAction={() => setDrawerOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e3050" }}>
                      {["Problem Name", "Platform", "Difficulty", "Topic", "Date"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>
                          {h}
                        </th>
                      ))}
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log: any) => (
                      <React.Fragment key={log.id}>
                        <tr className="transition-colors group" style={{ borderBottom: "1px solid #182840" }}>
                          <td className="px-5 py-3.5 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                            <div className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{log.problemName}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{log.topic}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: platformConfig[log.platform]?.color ?? "#3b82f6" }}
                              />
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                                style={{
                                  background: platformConfig[log.platform]?.bg ?? "rgba(59,130,246,0.12)",
                                  color: platformConfig[log.platform]?.color ?? "#3b82f6",
                                }}
                              >
                                {log.platform}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[12px] font-medium" style={{ color: difficultyColor(log.difficulty) }}>
                              {log.difficulty}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[12px]" style={{ color: "#94a3b8" }}>{log.topic}</span>
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-right" style={{ color: "#475569" }}>
                            {formatDate(log.solvedAt)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => deleteMutation.mutate(log.id)}
                              className="opacity-0 group-hover:opacity-100 transition-all"
                              style={{ color: "#475569" }}
                            >
                              <i className="ti ti-trash text-sm hover:text-[#ef4444]" />
                            </button>
                          </td>
                        </tr>
                        {expandedId === log.id && log.description && (
                          <tr style={{ borderBottom: "1px solid #182840", background: "#0c1524" }}>
                            <td colSpan={6} className="px-5 py-3">
                              <p className="text-[12px] leading-relaxed" style={{ color: "#64748b" }}>{log.description}</p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && filteredLogs.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #1e3050" }}>
                <span className="text-[11px]" style={{ color: "#475569" }}>
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ borderColor: "#1e3050", color: "#475569" }}
                  >
                    <i className="ti ti-chevron-left text-sm" />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-7 h-7 rounded-lg border text-[12px] transition-all"
                      style={p === page
                        ? { background: "#3b82f6", borderColor: "#3b82f6", color: "white" }
                        : { borderColor: "#1e3050", color: "#475569" }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ borderColor: "#1e3050", color: "#475569" }}
                  >
                    <i className="ti ti-chevron-right text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="w-full max-w-[400px] flex flex-col h-full border-l"
            style={{
              background: "#0f172a",
              borderColor: "#1e3050",
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1e3050" }}>
              <div>
                <span className="text-[16px] font-semibold" style={{ color: "#f1f5f9" }}>New Coding Log</span>
                <p className="text-[12px] mt-0.5" style={{ color: "#475569" }}>Track your problem-solving progress</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#131c31]" style={{ color: "#475569" }}>
                <i className="ti ti-x text-base hover:text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {formError && (
                  <div className="px-3 py-2.5 rounded-xl text-[12px] flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                    <i className="ti ti-alert-circle text-sm" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Problem Name</label>
                  <input
                    value={form.problemName}
                    onChange={(e) => setForm({ ...form, problemName: e.target.value })}
                    placeholder="e.g. Two Sum"
                    required
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Problem Link <span style={{ color: "#475569" }}>(optional)</span></label>
                  <input
                    value={form.problemLink}
                    onChange={(e) => setForm({ ...form, problemLink: e.target.value })}
                    placeholder="https://leetcode.com/problems/..."
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                      style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                    >
                      {["LeetCode", "GFG", "Codeforces"].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                      style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                    >
                      {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Topic</label>
                  <input
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="e.g. Arrays, Binary Search, DP"
                    required
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>
                    Description <span style={{ color: "#475569" }}>(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What approach did you use?"
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors resize-none"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Time (minutes)</label>
                    <input
                      type="number"
                      value={form.timeSpentMinutes}
                      onChange={(e) => setForm({ ...form, timeSpentMinutes: e.target.value })}
                      placeholder="30"
                      required min={1}
                      className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                      style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Attempts</label>
                    <input
                      type="number"
                      value={form.attempts}
                      onChange={(e) => setForm({ ...form, attempts: e.target.value })}
                      placeholder="1"
                      required min={1}
                      className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                      style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5 font-medium" style={{ color: "#94a3b8" }}>Solved At</label>
                  <input
                    type="datetime-local"
                    value={form.solvedAt}
                    onChange={(e) => setForm({ ...form, solvedAt: e.target.value })}
                    required
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#f1f5f9" }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: "#1e3050" }}>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] transition-all"
                  style={{ borderColor: "#1e3050", color: "#94a3b8" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-medium transition-all disabled:opacity-50"
                  style={{ background: "#3b82f6" }}
                >
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

export default CodingPage;