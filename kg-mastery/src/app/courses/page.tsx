"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getAuthToken, clearAuthToken } from "@/lib/utils";
import { Plus, LogOut, Sparkles } from "lucide-react";

interface Course {
    id: string;
    name: string;
    created_at: string;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!getAuthToken()) {
            router.replace("/login");
            return;
        }
        fetchCourses();
    }, [router]);

    const fetchCourses = async () => {
        try {
            const res = await apiFetch("/api/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await apiFetch("/api/courses", {
                method: "POST",
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/courses/${data.id}`);
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5AE79] rounded-full opacity-[0.02] blur-[120px]" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#C5AE79] tracking-tight">NEBULA</h1>
                        <p className="text-xs text-[#C5AE79]/50 mt-0.5">Your Courses</p>
                    </div>
                    <button
                        onClick={() => { clearAuthToken(); router.push("/login"); }}
                        className="flex items-center gap-1.5 text-xs text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>

                {/* Course List */}
                {loading ? (
                    <div className="text-center text-[#C5AE79]/40 py-20 text-sm">Loading...</div>
                ) : (
                    <div className="space-y-3">
                        {courses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => router.push(`/courses/${course.id}`)}
                                className="w-full text-left p-4 bg-[#111] border border-[#C5AE79]/15 rounded-xl hover:border-[#C5AE79]/40 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#C5AE79] group-hover:text-[#d6c292] transition-colors">
                                            {course.name}
                                        </h3>
                                        <p className="text-[10px] text-[#C5AE79]/40 mt-0.5">
                                            Created {new Date(course.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-[#C5AE79]/30 group-hover:text-[#C5AE79] transition-colors" />
                                </div>
                            </button>
                        ))}

                        {/* No courses message */}
                        {courses.length === 0 && !showCreate && (
                            <div className="text-center py-16 text-[#C5AE79]/40 text-sm">
                                <p className="mb-3">No courses yet.</p>
                                <p className="text-[#C5AE79]/30">Create your first course to get started.</p>
                            </div>
                        )}

                        {/* Create course */}
                        {showCreate ? (
                            <form onSubmit={handleCreate} className="p-4 bg-[#111] border border-[#C5AE79]/30 rounded-xl space-y-3">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Deep Learning Fundamentals"
                                    autoFocus
                                    className="w-full h-10 px-3 bg-[#0a0a0a] border border-[#C5AE79]/20 rounded-lg text-sm text-[#C5AE79] placeholder:text-[#C5AE79]/30"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={creating || !newName.trim()}
                                        className="flex-1 h-9 bg-[#C5AE79] text-[#0a0a0a] font-semibold text-xs rounded-lg disabled:opacity-40 transition-all"
                                    >
                                        {creating ? "Creating..." : "Create Course"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowCreate(false); setNewName(""); }}
                                        className="px-4 h-9 text-xs text-[#C5AE79]/60 hover:text-[#C5AE79] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="w-full p-4 border border-dashed border-[#C5AE79]/20 rounded-xl text-sm text-[#C5AE79]/50 hover:border-[#C5AE79]/40 hover:text-[#C5AE79] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Course
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
