import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getAuthToken, clearAuthToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, UploadCloud, Loader2, Network } from "lucide-react";
import clsx from "clsx";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import { Logo } from "@/components/Logo";
import { CourseNetwork } from "@/components/graph/CourseNetwork";

interface Course {
  id: string;
  name: string;
  created_at: string;
  masteryPercentage?: number;
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

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this constellation?")) return;
    
    try {
      const res = await apiFetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== courseId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Failed to delete course");
      }
    } catch (err) {
      alert("An error occurred while deleting the course");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-400 font-sans overflow-hidden">
      <BackgroundCanvas />
      
      <div className="relative z-10 h-full w-full overflow-y-auto min-h-screen">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3 text-white">
              <Logo size="md" />
              <span className="text-xl font-bold tracking-tight uppercase">Nebula</span>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAuthToken();
                navigate("/login");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 hover:text-white transition-all backdrop-blur-md"
              title="Sign Out"
            >
              <User className="h-4 w-4 text-zinc-300" />
            </button>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white tracking-wide uppercase">Your Constellations</h1>
              <p className="text-white/60">Pick up where you left off or initialize a new map.</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="border border-white/20 bg-white/[0.05] backdrop-blur-md font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all hover:bg-white/10 hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-wide">
                  <Network className="mr-2 h-4 w-4 text-white" />
                  Initialize Graph
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/20 bg-black/40 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium text-white tracking-wide uppercase">
                    Initialize Knowledge Graph
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleGenerate} className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 tracking-wide uppercase">Course Name</label>
                    <Input
                      placeholder="e.g. CS 101: Deep Learning"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="border-white/10 bg-white/[0.03] backdrop-blur-sm text-white placeholder:text-white/30 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/50 shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 tracking-wide uppercase">Source Material</label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={clsx(
                        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all backdrop-blur-sm",
                        selectedFile
                          ? "border-white/50 bg-white/10"
                          : "border-white/20 bg-white/[0.02] hover:border-white/50 hover:bg-white/[0.05]"
                      )}
                    >
                      <UploadCloud
                        className={clsx("h-10 w-10", selectedFile ? "text-white" : "text-white/50")}
                      />
                      <div className="text-sm">
                        {selectedFile ? (
                          <span className="font-medium text-white">
                            Syllabus attached successfully!
                          </span>
                        ) : (
                          <span className="text-white/60">
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
                    className="h-11 w-full border-white/20 bg-white/10 backdrop-blur-md font-medium text-white transition-all hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5 tracking-wide"
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
            <div className="py-10 text-sm text-white/50 text-center tracking-wide uppercase">Loading your universe...</div>
          ) : (
            <CourseNetwork courses={courses} onDelete={handleDeleteCourse} />
          )}
        </main>
      </div>
    </div>
  );
}
