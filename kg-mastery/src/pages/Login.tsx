import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import { API_BASE, setAuthToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }
      setAuthToken(data.token);
      navigate("/courses");
    } catch {
      setError("Cannot reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      <BackgroundCanvas />
      
      {/* Glassmorphism Window */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-white/20 bg-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-md overflow-hidden">
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">Nebula</span>
          </div>
          <button className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Login Form Content */}
        <div className="p-8 pt-6">
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <Logo size="4xl" />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-white tracking-wide uppercase">
              {isRegister ? "Sign Up" : "Sign In"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/50 h-11 rounded-lg backdrop-blur-sm transition-all hover:bg-white/[0.06] shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/50 h-11 rounded-lg backdrop-blur-sm transition-all hover:bg-white/[0.06] shadow-inner"
              />
            </div>

            {error && (
              <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg backdrop-blur-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all text-white font-medium tracking-wide rounded-lg backdrop-blur-md"
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-xs text-white/50 hover:text-white transition-colors tracking-wide"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
