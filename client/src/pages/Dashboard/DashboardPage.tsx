import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { SkeletonCard, SkeletonChart } from "../../components/ui/Skeleton";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c6ff7", "#22d3ee"];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const MOTIVATIONS = [
  "Stay focused and make it happen.",
  "One problem at a time.",
  "Build something great today.",
  "Keep the streak alive!",
  "Code, learn, grow.",
];

/* ─── Stat Card ─── */
const StatCard = ({
  label, value, sub, icon, accentColor, delay = 0,
}: {
  label: string; value: string | number; sub?: string;
  icon: string; accentColor: string; delay?: number;
}) => (
  <div
    className="glass-card p-5 opacity-0 animate-slide-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "#64748b" }}>{label}</span>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${accentColor}18` }}
      >
        <i className={`ti ${icon} text-base`} style={{ color: accentColor }} />
      </div>
    </div>
    <div className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#f1f5f9" }}>{value}</div>
    {sub && (
      <div className="mt-2.5">
        <div className="h-[3px] w-16 rounded-full" style={{ background: accentColor, opacity: 0.6 }} />
        <span className="text-[11px] mt-1.5 block" style={{ color: "#475569" }}>{sub}</span>
      </div>
    )}
  </div>
);

/* ─── Insight Section Config ─── */
interface InsightSection {
  title: string; icon: string;
  accentColor: string; bgColor: string; borderColor: string;
  items: string[];
}

const SECTION_DEFS: Record<string, Omit<InsightSection, "items">> = {
  strengths: {
    title: "Strengths This Week", icon: "ti-trophy",
    accentColor: "#10b981", bgColor: "#0c1f1a", borderColor: "#1a3a2e",
  },
  improvements: {
    title: "Areas to Improve", icon: "ti-target-arrow",
    accentColor: "#f59e0b", bgColor: "#1f1a0c", borderColor: "#3a2e1a",
  },
  suggestions: {
    title: "Suggestion for Next Week", icon: "ti-bulb",
    accentColor: "#7c6ff7", bgColor: "#14122a", borderColor: "#2a2a4a",
  },
};

const parseInsightSections = (text: string): InsightSection[] => {
  const sections: InsightSection[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  type SectionKey = "strengths" | "improvements" | "suggestions";
  let currentKey: SectionKey | null = null;
  let currentItems: string[] = [];

  const matchSection = (line: string): SectionKey | null => {
    const lower = line.toLowerCase().replace(/[*#\d.:\-]/g, "").trim();
    if (lower.includes("strength")) return "strengths";
    if (lower.includes("improve") || lower.includes("area")) return "improvements";
    if (lower.includes("suggest") || lower.includes("next week") || lower.includes("recommendation") || lower.includes("tip")) return "suggestions";
    return null;
  };

  const flushSection = () => {
    if (currentKey && currentItems.length > 0) {
      sections.push({ ...SECTION_DEFS[currentKey], items: [...currentItems] });
    }
    currentItems = [];
  };

  for (const line of lines) {
    const sectionMatch = matchSection(line);
    if (sectionMatch) {
      flushSection();
      currentKey = sectionMatch;
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const afterColon = line.slice(colonIdx + 1).replace(/[*#]/g, "").trim();
        if (afterColon) currentItems.push(afterColon);
      }
    } else if (currentKey) {
      const cleaned = line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
      if (cleaned) currentItems.push(cleaned);
    }
  }
  flushSection();

  if (sections.length === 0 && text.trim()) {
    sections.push({ ...SECTION_DEFS.strengths, title: "AI Weekly Insight", items: [text.trim()] });
  }
  return sections;
};

/* ─── Insight Card ─── */
const InsightCard = ({
  section, index, isExpanded, onToggle,
}: {
  section: InsightSection; index: number; isExpanded: boolean; onToggle: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{
        background: section.bgColor,
        border: `1px solid ${section.borderColor}`,
        transitionDelay: `${index * 80}ms`,
      }}
      onClick={onToggle}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: section.accentColor }}
      />
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${section.accentColor}22` }}>
              <i className={`ti ${section.icon} text-sm`} style={{ color: section.accentColor }} />
            </div>
            <span className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{section.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${section.accentColor}18`, color: section.accentColor }}>
              {section.items.length} {section.items.length === 1 ? "point" : "points"}
            </span>
          </div>
          <i className={`ti ti-chevron-down text-sm transition-transform duration-300
            ${isExpanded ? "rotate-180" : ""}`} style={{ color: "#475569" }} />
        </div>
        <div className={`overflow-hidden transition-all duration-400 ease-in-out
          ${isExpanded ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}`}>
          <div className="flex flex-col gap-2 pl-10">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[6px]"
                  style={{ background: section.accentColor }} />
                <p className="text-[12px] leading-relaxed" style={{ color: "#94a3b8" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Dashboard ─── */
const DashboardPage = () => {
  const { user } = useAuth();
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0]));

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["weekly-summary-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/weekly-summary");
      setInsight(res.data.insight);
      return res.data.summary;
    },
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["weekly-trend"],
    queryFn: async () => {
      const res = await api.get("/analytics/weekly-trend");
      return res.data.data;
    },
  });

  const { data: topicData, isLoading: topicLoading } = useQuery({
    queryKey: ["topic-distribution"],
    queryFn: async () => {
      const res = await api.get("/analytics/topics");
      return res.data.data;
    },
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["recent-coding-logs"],
    queryFn: async () => {
      const res = await api.get("/coding?page=1&limit=5");
      return res.data.data.logs ?? [];
    },
  });

  const { data: currentStreak } = useQuery({
    queryKey: ["current-streak"],
    queryFn: async () => {
      const res = await api.get("/analytics/streak");
      return res.data.data.current ?? 0;
    },
  });

  const handleRefreshInsight = async () => {
    setLoadingInsight(true);
    setInsight(null);
    setExpandedCards(new Set([0]));
    try {
      const res = await api.get("/dashboard/weekly-summary");
      setInsight(res.data.insight);
    } finally {
      setLoadingInsight(false);
    }
  };

  const insightSections = useMemo(() => {
    if (!insight) return [];
    return parseInsightSections(insight);
  }, [insight]);

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const difficultyColor = (d: string) => {
    if (d === "Easy") return "#10b981";
    if (d === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  const motivation = MOTIVATIONS[Math.floor(new Date().getMinutes() / 12) % MOTIVATIONS.length];
  const firstName = user?.name?.split(" ")[0] ?? "Developer";

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0b1120" }}>
      <div className="p-6 pb-10 flex flex-col gap-6 max-w-[1400px]">

        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-[30px] font-bold leading-tight tracking-tight" style={{ color: "#f1f5f9" }}>
            {getGreeting()},{" "}
            <span style={{ color: "#3b82f6" }}>{firstName}</span>
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#475569" }}>{motivation}</p>
        </div>

        {/* Stat Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Problems Solved" icon="ti-code" value={summary?.totalProblems ?? 0}
              sub={`${summary?.easy ?? 0}E · ${summary?.medium ?? 0}M · ${summary?.hard ?? 0}H`}
              accentColor="#3b82f6" delay={50} />
            <StatCard label="Project Hours" icon="ti-clock" value={`${summary?.totalProjectHours ?? 0}h`}
              sub="this week" accentColor="#10b981" delay={100} />
            <StatCard label="Productivity Score" icon="ti-bolt" value={summary?.productivityScore ?? 0}
              sub="/100 pts" accentColor="#f59e0b" delay={150} />
            <StatCard label="Current Streak" icon="ti-flame" value={`${currentStreak ?? 0} days`}
              sub="keep going!" accentColor="#ef4444" delay={200} />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trendLoading ? <SkeletonChart /> : (
            <div className="glass-card p-5 opacity-0 animate-slide-up"
              style={{ animationDelay: "250ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Coding Activity</span>
                  <span className="text-[12px] ml-2" style={{ color: "#475569" }}>Weekly Trend</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ border: "1px solid #1a3a2e", background: "#0c1f1a" }}>
                  <span className="live-dot" />
                  <span className="text-[11px] font-medium" style={{ color: "#10b981" }}>Live</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={trendData ?? []} barSize={24}>
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#131c31", border: "1px solid #1e3050", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                    labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#3b82f6" }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.06)" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {topicLoading ? <SkeletonChart /> : (
            <div className="glass-card p-5 opacity-0 animate-slide-up"
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Topic Distribution</span>
                <span className="text-[11px]" style={{ color: "#475569" }}>all time</span>
              </div>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={topicData ?? []} dataKey="count" nameKey="topic" cx="50%" cy="50%"
                      innerRadius={32} outerRadius={52} strokeWidth={0}>
                      {(topicData ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  {(topicData ?? []).slice(0, 5).map((t: any, i: number) => (
                    <div key={t.topic} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-[12px] truncate" style={{ color: "#94a3b8" }}>{t.topic}</span>
                      </div>
                      <span className="text-[12px] font-medium ml-2 flex-shrink-0" style={{ color: "#475569" }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insight */}
        {loadingInsight && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loadingInsight && insightSections.length > 0 && (
          <div className="opacity-0 animate-slide-up" style={{ animationDelay: "350ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-sparkles text-sm" style={{ color: "#7c6ff7" }} />
              <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>AI Weekly Insight</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #1e3050, transparent)" }} />
              <button onClick={handleRefreshInsight}
                className="text-[11px] px-3 py-1 rounded-lg text-white hover:shadow-lg transition-all"
                style={{ background: "#7c6ff7" }}>
                <i className="ti ti-refresh text-xs mr-1" />Refresh
              </button>
              <button
                onClick={() => {
                  const allExpanded = expandedCards.size === insightSections.length;
                  setExpandedCards(allExpanded ? new Set() : new Set(insightSections.map((_, i) => i)));
                }}
                className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                style={{ border: "1px solid #1e3050", color: "#475569" }}>
                {expandedCards.size === insightSections.length ? "Collapse all" : "Expand all"}
              </button>
            </div>
            <div className={`grid gap-3 ${insightSections.length >= 3 ? "grid-cols-1 md:grid-cols-3" : insightSections.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {insightSections.map((section, i) => (
                <InsightCard key={i} section={section} index={i}
                  isExpanded={expandedCards.has(i)} onToggle={() => toggleCard(i)} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        <div className="glass-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold" style={{ color: "#e2e8f0" }}>Recent Coding Logs</span>
            <span className="text-[11px]" style={{ color: "#475569" }}>last 5 entries</span>
          </div>
          <div className="flex flex-col">
            {(recentLogs ?? []).map((log: any, i: number) => (
              <div key={log.id}
                className={`flex items-center justify-between py-3 ${i !== (recentLogs.length - 1) ? "" : ""}`}
                style={i !== recentLogs.length - 1 ? { borderBottom: "1px solid #182840" } : {}}>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "#e2e8f0" }}>{log.problemName}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                    {log.platform} · {log.topic} · {log.timeSpentMinutes}min
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium ml-3 flex-shrink-0"
                  style={{ background: `${difficultyColor(log.difficulty)}18`, color: difficultyColor(log.difficulty) }}>
                  {log.difficulty}
                </span>
              </div>
            ))}
            {(!recentLogs || recentLogs.length === 0) && (
              <div className="text-center py-8">
                <i className="ti ti-code text-3xl mb-2 block" style={{ color: "#1e3050" }} />
                <p className="text-[13px]" style={{ color: "#475569" }}>No logs yet. Add your first coding log.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;