import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../../api/axios";

const COLORS = ["#7F77DD", "#1D9E75", "#EF9F27", "#E24B4A", "#4A9EE2"];

const StatCard = ({ label, value, sub, subColor, icon}: {
    label: string; value: string | number; sub?: string; subColor?: string; icon: string;
}) => (
    <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
    <div className="flex items-center gap-1.5 text-[11px] text-[#555560] mb-2">
      <i className={`ti ${icon} text-sm`} />
      <span className="uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-[26px] font-medium text-[#e8e8ec] leading-none">{value}</div>
    {sub && <div className={`text-[11px] mt-1.5 ${subColor ?? "text-[#555560]"}`}>{sub}</div>}
  </div>
)

const DashboardPage = () => {
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);

    const {data: summary } = useQuery({
        queryKey: ["weekly-summary-stats"],
        queryFn: async()=>{
            const res = await api.get("/dashboard/weekly-summary");
            setInsight(res.data.insight);
            return res.data.summary;
        }
    });

    const { data: trendData } = useQuery({
        queryKey: ["weekly-trend"],
        queryFn: async() => {
            const res = await api.get("/analytics/weekly-trend");
            return res.data.data;
        }
    });

    const { data: topicData } = useQuery({
        queryKey: ["topic-distribution"],
        queryFn: async()=>{
            const res = await api.get("/analytics/topics");
            return res.data.data;
        },
    });

    const { data: recentLogs } = useQuery({
        queryKey: ["recent-coding-logs"],
        queryFn: async() =>{
            const res = await api.get("/coding?page=1&limit=5");
            return res.data.data.logs ?? [];
        },
    });

    const { data: currentStreak } = useQuery({
        queryKey: ["current-streak"],
        queryFn: async()=>{
            const res = await api.get("/analytics/streak");
            return res.data.data.current ?? 0;
        }
    })

    const handleRefreshInsight = async()=>{
        setLoadingInsight(true);
        try{
            const res = await api.get("/dashboard/weekly-summary");
            setInsight(res.data.insight);
        }finally{
            setLoadingInsight(false);
        }
    };

    const difficultyPill = (d: string) => {
        if (d === "Easy") return "bg-[#0a2a1e] text-[#1D9E75]";
        if (d === "Medium") return "bg-[#2a1e0a] text-[#EF9F27]";
        return "bg-[#2a0a0a] text-[#E24B4A]";
    }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-[#e8e8ec]">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshInsight}
            disabled={loadingInsight}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md bg-[#7F77DD] text-white hover:bg-[#6e67cc] transition-colors disabled:opacity-50"
          >
            <i className="ti ti-sparkles text-sm" />
            {loadingInsight ? "Generating..." : "AI Insight"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Problems Solved"
            icon="ti-code"
            value={summary?.totalProblems ?? 0}
            sub={`${summary?.easy ?? 0}E · ${summary?.medium ?? 0}M · ${summary?.hard ?? 0}H`}
          />
          <StatCard
            label="Project Hours"
            icon="ti-clock"
            value={`${summary?.totalProjectHours ?? 0}h`}
            sub="this week"
          />
          <StatCard
            label="Productivity Score"
            icon="ti-bolt"
            value={summary?.productivityScore ?? 0}
            sub="/100 pts"
          />
          <StatCard
            label="Active Days"
            icon="ti-calendar"
            value={`${currentStreak}`} 
            sub="see analytics"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weekly Trend */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#888896]">Weekly Trend</span>
              <span className="text-[11px] text-[#555560]">last 6 weeks</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={trendData ?? []} barSize={20}>
                <XAxis dataKey="week" tick={{ fill: "#444450", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1a1a22", border: "1px solid #2a2a2e", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#888896" }}
                  itemStyle={{ color: "#a09df5" }}
                />
                <Bar dataKey="count" fill="#7F77DD" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Distribution */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#888896]">Topic Distribution</span>
              <span className="text-[11px] text-[#555560]">all time</span>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie
                    data={topicData ?? []}
                    dataKey="count"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={44}
                  >
                    {(topicData ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1">
                {(topicData ?? []).slice(0, 4).map((t: any, i: number) => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] text-[#888896]">{t.topic}</span>
                    </div>
                    <span className="text-[11px] text-[#555560]">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        {insight && (
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="ti ti-sparkles text-[#7F77DD] text-sm" />
              <span className="text-[12px] font-medium text-[#888896]">AI Weekly Insight</span>
            </div>
            <p className="text-[12px] text-[#666672] leading-relaxed">{insight}</p>
          </div>
        )}

        {/* Recent Logs */}
        <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-[#888896]">Recent Coding Logs</span>
          </div>
          <div className="flex flex-col">
            {(recentLogs ?? []).map((log: any, i: number) => (
              <div
                key={log.id}
                className={`flex items-center justify-between py-2.5 ${i !== (recentLogs.length - 1) ? "border-b border-[#1e1e22]" : ""}`}
              >
                <div>
                  <div className="text-[13px] text-[#c8c8d4]">{log.problemName}</div>
                  <div className="text-[11px] text-[#444450] mt-0.5">{log.platform} · {log.topic} · {log.timeSpentMinutes}min</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${difficultyPill(log.difficulty)}`}>
                  {log.difficulty}
                </span>
              </div>
            ))}
            {(!recentLogs || recentLogs.length === 0) && (
              <p className="text-[12px] text-[#444450] py-2">No logs yet. Add your first coding log.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;