import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../../api/axios";

const COLORS = ["#7F77DD", "#1D9E75", "#EF9F27", "#E24B4A", "#4A9EE2", "#a09df5"];

const AnalyticsPage = () => {
  const { data: streakData } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await api.get("/analytics/streak");
      return res.data.data ?? { current: 0, best: 0 };
    },
  });

  const { data: trendData } = useQuery({
    queryKey: ["weekly-trend"],
    queryFn: async () => {
      const res = await api.get("/analytics/weekly-trend");
      return res.data.data ?? [];
    },
  });

  const { data: topicData } = useQuery({
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

  const recentHard = codingData
    ?.filter((l: any) => l.difficulty === "Hard")
    .slice(0, 5) ?? [];

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
    if (count === 0) return "#1a1a22";
    if (count === 1) return "#3a3560";
    if (count === 2) return "#5a52a0";
    if (count >= 3) return "#7F77DD";
    return "#1a1a22";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#e8e8ec]">Analytics</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#1e1e28] border border-[#3a3a4e] text-[#555560]">
            Last 90 days
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

        {/* Top row — streak + problems solved */}
        <div className="grid grid-cols-3 gap-3">

          {/* Current Streak */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wide text-[#555560]">Current Streak</span>
              <i className="ti ti-flame text-[#EF9F27] text-base" />
            </div>
            <div className="text-[32px] font-medium text-[#e8e8ec] leading-none">
              {streakData?.current ?? 0}
              <span className="text-[14px] text-[#555560] ml-1">days</span>
            </div>
            <div className="text-[11px] text-[#1D9E75] mt-2">
              ↑ best: {streakData?.best ?? 0} days
            </div>
          </div>

          {/* Problems Solved */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wide text-[#555560]">Problems Solved</span>
              <i className="ti ti-code text-[#7F77DD] text-base" />
            </div>
            <div className="text-[32px] font-medium text-[#e8e8ec] leading-none">{totalProblems}</div>
            {/* Difficulty bar */}
            <div className="mt-3">
              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                <div className="bg-[#1D9E75] rounded-full" style={{ width: `${totalProblems ? (easy / totalProblems) * 100 : 0}%` }} />
                <div className="bg-[#EF9F27] rounded-full" style={{ width: `${totalProblems ? (medium / totalProblems) * 100 : 0}%` }} />
                <div className="bg-[#E24B4A] rounded-full" style={{ width: `${totalProblems ? (hard / totalProblems) * 100 : 0}%` }} />
              </div>
              <div className="flex gap-3 mt-1.5">
                <span className="text-[10px] text-[#1D9E75]">Easy: {easy}</span>
                <span className="text-[10px] text-[#EF9F27]">Med: {medium}</span>
                <span className="text-[10px] text-[#E24B4A]">Hard: {hard}</span>
              </div>
            </div>
          </div>

          {/* Topic Focus */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wide text-[#555560]">Topic Focus</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(topicData ?? []).slice(0, 4).map((t: any, i: number) => (
                <div key={t.topic} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[11px] text-[#888896]">{t.topic}</span>
                    <span className="text-[11px] text-[#555560]">{t.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-[#888896]">Activity Heatmap</span>
            <span className="text-[11px] text-[#555560]">{totalProblems} contributions</span>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {heatmapData.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} problems`}
                className="w-3 h-3 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: heatmapColor(d.count) }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[10px] text-[#444450]">Less</span>
            {["#1a1a22", "#3a3560", "#5a52a0", "#7F77DD"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-[#444450]">More</span>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-3">
          {/* 6 week trend */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#888896]">6-Week Problem Trend</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trendData ?? []} barSize={24}>
                <XAxis dataKey="week" tick={{ fill: "#444450", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#444450", fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{ background: "#1a1a22", border: "1px solid #2a2a2e", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#888896" }}
                  itemStyle={{ color: "#a09df5" }}
                />
                <Bar dataKey="count" fill="#7F77DD" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic donut */}
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-medium text-[#888896]">Topic Distribution</span>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={topicData ?? []}
                    dataKey="count"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                  >
                    {(topicData ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1a22", border: "1px solid #2a2a2e", borderRadius: 6, fontSize: 12 }}
                    itemStyle={{ color: "#a09df5" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {(topicData ?? []).map((t: any, i: number) => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] text-[#888896]">{t.topic}</span>
                    </div>
                    <span className="text-[11px] text-[#555560]">
                      {totalProblems ? Math.round((t.count / totalProblems) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Hard Submissions */}
        {recentHard.length > 0 && (
          <div className="bg-[#111114] border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-[#888896]">Recent Hard Submissions</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2e]">
                  {["Problem", "Platform", "Topic", "Time", "Date"].map((h) => (
                    <th key={h} className="text-left pb-2 text-[11px] text-[#555560] font-medium uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentHard.map((log: any, i: number) => (
                  <tr key={log.id} className={i !== recentHard.length - 1 ? "border-b border-[#1e1e22]" : ""}>
                    <td className="py-2.5">
                      <div className="text-[13px] text-[#c8c8d4]">{log.problemName}</div>
                      <div className="text-[10px] text-[#E24B4A] mt-0.5">Hard · {log.topic}</div>
                    </td>
                    <td className="py-2.5 text-[12px] text-[#888896]">{log.platform}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a22] border border-[#2a2a2e] text-[#666672]">
                        {log.topic}
                      </span>
                    </td>
                    <td className="py-2.5 text-[12px] text-[#888896]">{log.timeSpentMinutes}m</td>
                    <td className="py-2.5 text-[12px] text-[#555560]">
                      {new Date(log.solvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsPage;