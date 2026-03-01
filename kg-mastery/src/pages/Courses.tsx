import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getAuthToken, clearAuthToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Network, User, UploadCloud, Loader2 } from "lucide-react";
import clsx from "clsx";

interface Course {
  id: string;
  name: string;
  created_at: string;
}

function formatLastUpdated(created_at: string): string {
  const d = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login", { replace: true });
      return;
    }
    fetchCourses();
  }, [navigate]);

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

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") setSelectedFile(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !selectedFile) return;

    setIsGenerating(true);
    try {
      const createRes = await apiFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify({ name: courseName.trim() }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create course");
      }
      const { id: courseId } = await createRes.json();

      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await apiFetch(`/api/courses/${courseId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }

      setIsDialogOpen(false);
      setCourseName("");
      setSelectedFile(null);
      navigate(`/courses/${courseId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-white">
            <Network className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-xl font-bold tracking-tight">Nebula</span>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              navigate("/login");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10"
            title="Sign Out"
          >
            <User className="h-4 w-4 text-zinc-300" />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Your Constellations</h1>
            <p className="text-zinc-500">Pick up where you left off or initialize a new map.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border border-cyan-500/50 bg-zinc-900 font-medium text-white shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all hover:border-cyan-400 hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Network className="mr-2 h-4 w-4 text-cyan-400" />
                Initialize Graph
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-950 text-white shadow-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                  Initialize Knowledge Graph
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleGenerate} className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Course Name</label>
                  <Input
                    placeholder="e.g. CS 101: Deep Learning"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="border-white/10 bg-white/5 text-white focus-visible:border-cyan-500 focus-visible:ring-1 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Source Material</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                      "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all",
                      selectedFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-white/20 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10"
                    )}
                  >
                    <UploadCloud
                      className={clsx("h-10 w-10", selectedFile ? "text-emerald-400" : "text-zinc-500")}
                    />
                    <div className="text-sm">
                      {selectedFile ? (
                        <span className="font-medium text-emerald-400">
                          Syllabus attached successfully!
                        </span>
                      ) : (
                        <span className="text-zinc-400">
                          Drag & Drop Syllabus/Textbook PDF
                          <br />
                          or click to browse
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!courseName.trim() || !selectedFile || isGenerating}
                  className="h-11 w-full border-none bg-cyan-600 font-medium text-white transition-all hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Weaving network...
                    </>
                  ) : (
                    "Generate Constellation"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="py-10 text-sm text-zinc-500">Loading your universe...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {courses.map((course) => {
              const hash = course.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
              const masteryPercentage = (hash % 80) + 10;
              return (
                <div
                  key={course.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/courses/${course.id}`)}
                  className="flex h-full flex-col cursor-pointer rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:border-white/20 hover:bg-zinc-900 group"
                >
                  <div className="flex-1">
                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-zinc-100 transition-colors group-hover:text-white">
                      {course.name}
                    </h3>
                    <p className="mb-6 flex items-center gap-1 text-xs text-zinc-500">
                      Last updated {formatLastUpdated(course.created_at)}
                    </p>
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Mastery</span>
                      <span className="font-medium text-zinc-300">{masteryPercentage}%</span>
                    </div>
                    <Progress
                      value={masteryPercentage}
                      className="h-1.5 bg-white/5"
                      indicatorClassName="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
