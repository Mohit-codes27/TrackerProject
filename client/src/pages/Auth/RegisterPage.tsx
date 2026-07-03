import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0b1120" }}
    >
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #7c6ff7)" }}
          >
            <i className="ti ti-rocket text-white text-lg" />
          </div>
          <span className="text-xl font-bold text-[#f1f5f9]">DevTrack</span>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          <h1 className="text-[18px] font-semibold text-[#f1f5f9] mb-1">Create account</h1>
          <p className="text-[13px] text-[#475569] mb-7">Start tracking your progress</p>

          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-[12px] flex items-center gap-2">
              <i className="ti ti-alert-circle text-sm" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[12px] text-[#94a3b8] mb-2 font-medium">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
                className="w-full bg-[#0c1020] border border-[#1e293b] rounded-xl px-4 py-2.5 text-[13px] text-[#f1f5f9] placeholder-[#475569] focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#94a3b8] mb-2 font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
                className="w-full bg-[#0c1020] border border-[#1e293b] rounded-xl px-4 py-2.5 text-[13px] text-[#f1f5f9] placeholder-[#475569] focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#94a3b8] mb-2 font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-[#0c1020] border border-[#1e293b] rounded-xl px-4 py-2.5 text-[13px] text-[#f1f5f9] placeholder-[#475569] focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1
                hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #7c6ff7)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ti ti-loader-2 animate-spin text-sm" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#475569] mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
