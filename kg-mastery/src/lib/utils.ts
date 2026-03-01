import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getStatusFromConfidence(confidence: number) {
    if (confidence === 0) return { label: "Unseen", emoji: "⚫", color: "grey" } as const;
    if (confidence < 0.4) return { label: "Struggling", emoji: "🔴", color: "red" } as const;
    if (confidence < 0.7) return { label: "Exposed", emoji: "🟡", color: "gold" } as const;
    return { label: "Mastered", emoji: "🟢", color: "cyan" } as const;
}

/** For display in details panel: Low / Medium / High */
export function getConfidenceLevel(confidence: number): "Low" | "Medium" | "High" {
    if (confidence === 0 || confidence < 0.4) return "Low";
    if (confidence < 0.7) return "Medium";
    return "High";
}

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nebula_token");
}

export function setAuthToken(token: string) {
    localStorage.setItem("nebula_token", token);
}

export function clearAuthToken() {
    localStorage.removeItem("nebula_token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        clearAuthToken();
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    return res;
}
