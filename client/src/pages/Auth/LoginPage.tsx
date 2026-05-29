import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            await login(email, password);
            navigate("/");
        }catch(err: any){
            setError(err?.response?.data?.message || "Invalid email or password");
        }finally{
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center">
            <i className="ti ti-terminal-2 text-white text-base" />
          </div>
          <span className="text-lg font-medium text-[#e8e8ec]">DevTrack</span>
        </div>

        {/* Card */}
        <div className="bg-[#111114] border border-[#2a2a2e] rounded-xl p-6">
          <h1 className="text-[15px] font-medium text-[#e8e8ec] mb-1">Welcome back</h1>
          <p className="text-[13px] text-[#555560] mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[#2a0a0a] border border-[#4a1a1a] text-[#E24B4A] text-[12px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] text-[#888896] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#888896] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0d0d0f] border border-[#2a2a2e] rounded-md px-3 py-2 text-[13px] text-[#e8e8ec] placeholder-[#444450] focus:outline-none focus:border-[#7F77DD] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6e67cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[#555560] mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#a09df5] hover:text-[#7F77DD] transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;