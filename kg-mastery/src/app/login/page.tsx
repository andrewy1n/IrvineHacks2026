"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, setAuthToken } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
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
            router.push("/courses");
        } catch {
            setError("Cannot reach the server");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5AE79] rounded-full opacity-[0.03] blur-[150px]" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-[#C5AE79] mb-1">
                        NEBULA
                    </h1>
                    <p className="text-sm text-[#C5AE79]/50">
                        Knowledge Graph Mastery
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#111] border border-[#C5AE79]/20 rounded-2xl p-6 space-y-4 shadow-[0_0_40px_rgba(197,174,121,0.08)]"
                >
                    <div>
                        <label className="block text-xs font-medium text-[#C5AE79]/70 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-10 px-3 bg-[#0a0a0a] border border-[#C5AE79]/20 rounded-lg text-sm text-[#C5AE79] placeholder:text-[#C5AE79]/30 transition-colors"
                            placeholder="you@university.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#C5AE79]/70 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={4}
                            className="w-full h-10 px-3 bg-[#0a0a0a] border border-[#C5AE79]/20 rounded-lg text-sm text-[#C5AE79] placeholder:text-[#C5AE79]/30 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-[#C5AE79] hover:bg-[#d6c292] text-[#0a0a0a] font-semibold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(197,174,121,0.3)] disabled:opacity-50"
                    >
                        {loading ? "..." : isRegister ? "Create Account" : "Sign In"}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setIsRegister(!isRegister); setError(""); }}
                        className="w-full text-xs text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors text-center"
                    >
                        {isRegister
                            ? "Already have an account? Sign in"
                            : "Don't have an account? Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}
