import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import api from "../../api/axios";
import { SkeletonCard, SkeletonChart } from "../../components/ui/Skeleton";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c6ff7", "#22d3ee"];

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState("30");

  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await api.get("/analytics/streak");
      return res.data.data ?? { current: 0, best: 0 };
    },
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["weekly-trend"],
    queryFn: async () => {
      const res = await api.get("/analytics/weekly-trend");
      return res.data.data ?? [];
    },
  });

  const { data: topicData, isLoading: topicLoading } = useQuery({
    queryKey: ["topic-distribution"],
    queryFn: async () => {
      const res = await api.get("/analytics/topics");
      return res.data.data ?? [];
    },
  });

  const { data: codingData } = useQuery({
    queryKey: ["all-coding-logs"],
    queryFn: async () => {
      const res = await api.get("/coding?page=1&limit=100");
      return res.data.data.logs ?? [];
    },
  });

  const totalProblems = codingData?.length ?? 0;
  const easy = codingData?.filter((l: any) => l.difficulty === "Easy").length ?? 0;
  const medium = codingData?.filter((l: any) => l.difficulty === "Medium").length ?? 0;
  const hard = codingData?.filter((l: any) => l.difficulty === "Hard").length ?? 0;

  // Build heatmap data — last 90 days
  const heatmapData = (() => {
    const map: Record<string, number> = {};
    (codingData ?? []).forEach((l: any) => {
      const d = new Date(l.solvedAt).toISOString().slice(0, 10);
      map[d] = (map[d] ?? 0) + 1;
    });
    const days: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map[key] ?? 0 });
    }
    return days;
  })();

  const heatmapColor = (count: number) => {
    if (count === 0) return "#1e3050";
    if (count === 1) return "#1e3a5f";
    if (count === 2) return "#2563eb";
    if (count >= 3) return "#3b82f6";
    return "#1e3050";
  };

  const recentHard = codingData?.filter((l: any) => l.difficulty === "Hard").slice(0, 5) ?? [];

  const productivityTrend = (trendData ?? []).map((t: any) => ({
    ...t,
    coding: t.count,
    planning: Math.floor(Math.random() * 3) + 1,
  }));

  const handleExport = () => {
    const csvContent = [
      "Date,Problem,Platform,Difficulty,Topic,Time(min)",
      ...(codingData ?? []).map((l: any) =>
        `${new Date(l.solvedAt).toLocaleDateString()},${l.problemName},${l.platform},${l.difficulty},${l.topic},${l.timeSpentMinutes}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0b1120" }}>
      <div className="p-6 pb-10 flex flex-col gap-6 max-w-[1400px]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in pr-2">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold tracking-tight truncate" style={{ color: "#f1f5f9" }}>Performance Analytics</h1>
            <p className="text-[14px] mt-1 truncate" style={{ color: "#475569" }}>Track your productivity growth and topic distribution.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none rounded-xl px-4 py-2 text-[13px] pr-8 cursor-pointer transition-colors"
                style={{ background: "#0d1526", border: "1px solid #1e3050", color: "#e2e8f0" }}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <i className="ti ti-calendar absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: "#475569" }} />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
              style={{ background: "#3b82f6", color: "white", boxShadow: "0 4px 12px rgba(59,130,246,0.25)" }}
            >
              <i className="ti ti-download text-sm" />
              Export
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        {streakLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Streak */}
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "50ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "#64748b" }}>Current Streak</span>
                <i className="ti ti-flame text-lg" style={{ color: "#f59e0b" }} />
              </div>
              <div className="text-[32px] font-bold leading-none" style={{ color: "#f1f5f9" }}>
                {streakData?.current ?? 0}
                <span className="text-[14px] ml-1.5 font-medium" style={{ color: "#475569" }}>days</span>
              </div>
              <div className="text-[11px] mt-2 flex items-center gap-1" style={{ color: "#10b981" }}>
                <i className="ti ti-trending-up text-xs" />
                best: {streakData?.best ?? 0} days
              </div>
            </div>

            {/* Problems Solved */}
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "#64748b" }}>Problems Solved</span>
                <i className="ti ti-code text-lg" style={{ color: "#3b82f6" }} />
              </div>
              <div className="text-[32px] font-bold leading-none" style={{ color: "#f1f5f9" }}>{totalProblems}</div>
              <div className="mt-3">
                <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 w-full bg-[#1e3050]">
                  <div className="bg-[#10b981] rounded-full transition-all duration-500" style={{ width: `${totalProblems ? (easy / totalProblems) * 100 : 0}%` }} />
                  <div className="bg-[#f59e0b] rounded-full transition-all duration-500" style={{ width: `${totalProblems ? (medium / totalProblems) * 100 : 0}%` }} />
                  <div className="bg-[#ef4444] rounded-full transition-all duration-500" style={{ width: `${totalProblems ? (hard / totalProblems) * 100 : 0}%` }} />
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px]" style={{ color: "#10b981" }}>Easy: {easy}</span>
                  <span className="text-[10px]" style={{ color: "#f59e0b" }}>Med: {medium}</span>
                  <span className="text-[10px]" style={{ color: "#ef4444" }}>Hard: {hard}</span>
                </div>
              </div>
            </div>

            {/* Topic Focus */}
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "#64748b" }}>Top Topics</span>
              </div>
              <div className="flex flex-col gap-2">
                {(topicData ?? []).slice(0, 4).map((t: any, i: number) => (
                  <div key={t.topic} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-[12px] truncate" style={{ color: "#94a3b8" }}>{t.topic}</span>
                      <span className="text-[12px] font-medium ml-2" style={{ color: "#475569" }}>{t.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Productivity Trend Chart */}
        {trendLoading ? (
          <SkeletonChart height={220} />
        ) : (
          <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <span className="text-[16px] font-semibold" style={{ color: "#e2e8f0" }}>Productivity Trend</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3b82f6" }} />
                  <span className="text-[11px]" style={{ color: "#94a3b8" }}>Coding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
                  <span className="text-[11px]" style={{ color: "#94a3b8" }}>Planning</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productivityTrend}>
                <defs>
                  <linearGradient id="codingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="planningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "#131c31", border: "1px solid #1e3050", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="coding" stroke="#3b82f6" fill="url(#codingGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="planning" stroke="#f59e0b" fill="url(#planningGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activity Heatmap */}
        <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "250ms", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Activity Heatmap</span>
            <span className="text-[11px]" style={{ color: "#475569" }}>{totalProblems} contributions</span>
          </div>
          <div className="flex flex-wrap gap-[3px] overflow-hidden">
            {heatmapData.map((d, i) => (
              <div
                key={i}
                title={`${d.date}: ${d.count} problems`}
                className="w-3.5 h-3.5 rounded-sm cursor-pointer hover:opacity-80 transition-all hover:scale-110"
                style={{ background: heatmapColor(d.count) }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px]" style={{ color: "#475569" }}>Less</span>
            {["#1e3050", "#1e3a5f", "#2563eb", "#3b82f6"].map((c) => (
              <div key={c} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-[10px]" style={{ color: "#475569" }}>More</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 6 week trend */}
          {trendLoading ? (
            <SkeletonChart />
          ) : (
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>6-Week Problem Trend</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trendData ?? []} barSize={28}>
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip
                    contentStyle={{ background: "#131c31", border: "1px solid #1e3050", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#3b82f6" }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Topic donut */}
          {topicLoading ? (
            <SkeletonChart />
          ) : (
            <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "350ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Topic Distribution</span>
              </div>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={topicData ?? []} dataKey="count" nameKey="topic" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0}>
                      {(topicData ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#131c31", border: "1px solid #1e3050", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                      itemStyle={{ color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  {(topicData ?? []).map((t: any, i: number) => (
                    <div key={t.topic} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-[12px] truncate" style={{ color: "#94a3b8" }}>{t.topic}</span>
                      </div>
                      <span className="text-[12px] font-medium ml-2" style={{ color: "#475569" }}>
                        {totalProblems ? Math.round((t.count / totalProblems) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Hard Submissions */}
        {recentHard.length > 0 && (
          <div className="glass-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-3" style={{ borderBottom: "1px solid #1e3050" }}>
              <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Recent Hard Submissions</span>
              <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {recentHard.length} entries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e3050" }}>
                    {["Problem", "Platform", "Topic", "Time", "Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentHard.map((log: any, i: number) => (
                    <tr key={log.id} className="transition-colors group hover:bg-[rgba(59,130,246,0.03)]" style={i !== recentHard.length - 1 ? { borderBottom: "1px solid #182840" } : {}}>
                      <td className="px-5 py-3.5">
                        <div className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{log.problemName}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#ef4444" }}>Hard · {log.topic}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "#94a3b8" }}>{log.platform}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg border" style={{ background: "#0f172a", borderColor: "#1e3050", color: "#64748b" }}>
                          {log.topic}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "#94a3b8" }}>{log.timeSpentMinutes}m</td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "#475569" }}>
                        {new Date(log.solvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsPage;