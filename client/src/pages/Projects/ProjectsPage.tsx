import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const CATEGORIES = ["All", "Frontend", "Backend", "FullStack"];

const categoryColor = (c: string) => {
  if (c === "Frontend") return "bg-[#0a1a2a] text-[#4A9EE2] border-[#1a2a3a]";
  if (c === "Backend") return "bg-[#0a2a1e] text-[#1D9E75] border-[#1a3a2a]";
  return "bg-[#1e1a2a] text-[#a09df5] border-[#2a2a4a]";
};

const emptyForm = {
  projectName: "",
  category: "FullStack",
  techStack: "",
  description: "",
  hoursLogged: "",
  loggedAt: new Date().toISOString().slice(0, 16),
};

const ProjectsPage = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("All");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
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
        queryClient.invalidateQueries({queryKey: ["project-logs"]});
        queryClient.invalidateQueries({ queryKey: ["weekly-summary-stats"]});
        setDrawerOpen(false);
        setForm(emptyForm);
        setFormError("");
    },
    onError: (err: any) => {
        setFormError(err?.response?.data?.message || "Failed to create log");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["project-logs"]});
    },
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

  const filtered = logs.filter((l: any) => {
    if (category !== "All" && l.category !== category) return false;
    return true;
  });

return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#e8e8ec]">Projects</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#1e1e28] border border-[#3a3a4e] text-[#555560]">
            {total} entries
          </span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md bg-[#7F77DD] text-white hover:bg-[#6e67cc] transition-colors"
        >
          <i className="ti ti-plus text-sm" />
          Create Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#2a2a2e] flex-shrink-0">
        <span className="text-[11px] text-[#555560]">Category:</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
              category === c
                ? "bg-[#1e1e28] border-[#3a3a4e] text-[#a09df5]"
                : "border-[#2a2a2e] text-[#555560] hover:text-[#888896]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-[#555560] text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <i className="ti ti-folders text-[#2a2a2e] text-3xl" />
            <p className="text-[#555560] text-sm">No project logs yet. Add your first one.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2e]">
                {["Project Name", "Category", "Tech Stack", "Hours Logged", "Last Update"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[11px] text-[#555560] font-medium uppercase tracking-wide">
                    {h}
                  </th>
                ))}
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any) => (
                <tr key={log.id} className="border-b border-[#1e1e22] hover:bg-[#111114] transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD]" />
                      <span className="text-[13px] text-[#c8c8d4]">{log.projectName}</span>
                    </div>
                    {log.description && (
                      <p className="text-[11px] text-[#444450] mt-0.5 ml-3.5 truncate max-w-[200px]">
                        {log.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${categoryColor(log.category)}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(log.techStack ?? []).slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a22] border border-[#2a2a2e] text-[#666672]">
                          {t}
                        </span>
                      ))}
                      {(log.techStack ?? []).length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a22] border border-[#2a2a2e] text-[#444450]">
                          +{log.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-[#c8c8d4] font-medium">{log.hoursLogged}h</span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#555560]">
                    {new Date(log.loggedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#444450] hover:text-[#E24B4A] transition-all"
                    >
                      <i className="ti ti-trash text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2a2a2e] flex-shrink-0">
          <span className="text-[11px] text-[#555560]">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} logs
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded border border-[#2a2a2e] text-[#555560] hover:text-[#c8c8d4] disabled:opacity-30 flex items-center justify-center"
            >
              <i className="ti ti-chevron-left text-sm" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded border text-[12px] transition-colors ${
                  p === page
                    ? "bg-[#1e1e28] border-[#3a3a4e] text-[#a09df5]"
                    : "border-[#2a2a2e] text-[#555560] hover:text-[#c8c8d4]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-7 h-7 rounded border border-[#2a2a2e] text-[#555560] hover:text-[#c8c8d4] disabled:opacity-30 flex items-center justify-center"
            >
              <i className="ti ti-chevron-right text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="w-[380px] bg-[#111114] border-l border-[#2a2a2e] flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2e]">
              <span className="text-[14px] font-medium text-[#e8e8ec]">New Project Log</span>
              <button onClick={() => setDrawerOpen(false)} className="text-[#555560] hover:text-[#c8c8d4]">
                <i className="ti ti-x text-base" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {formError && (
                <div className="px-3 py-2 rounded bg-[#2a0a0a] border border-[#4a1a1a] text-[#E24B4A] text-[12px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[12px] text-[#888896] mb-1.5">Project Name</label>
                <input
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  placeholder="e.g. DevTrack"
                  required
                  className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#888896] mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] focus:outline-none focus:border-[#7F77DD] transition-colors"
                >
                  {["Frontend", "Backend", "FullStack"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] text-[#888896] mb-1.5">Tech Stack <span className="text-[#444450]">(comma separated)</span></label>
                <input
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="React, Node.js, PostgreSQL"
                  className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#888896] mb-1.5">Description <span className="text-[#444450]">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What did you work on?"
                  rows={3}
                  className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[#888896] mb-1.5">Hours Logged</label>
                  <input
                    type="number"
                    value={form.hoursLogged}
                    onChange={(e) => setForm({ ...form, hoursLogged: e.target.value })}
                    placeholder="2.5"
                    required
                    min={0.5}
                    step={0.5}
                    className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#888896] mb-1.5">Logged At</label>
                  <input
                    type="datetime-local"
                    value={form.loggedAt}
                    onChange={(e) => setForm({ ...form, loggedAt: e.target.value })}
                    required
                    className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] focus:outline-none focus:border-[#7F77DD] transition-colors"
                  />
                </div>
              </div>
            </form>

            <div className="px-5 py-4 border-t border-[#2a2a2e] flex gap-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2 rounded-md border border-[#2a2a2e] text-[13px] text-[#888896] hover:text-[#c8c8d4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex-1 py-2 rounded-md bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6e67cc] transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "Saving..." : "Save Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;