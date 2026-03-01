import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useNebulaStore } from "@/store/nebulaStore";
import { getAuthToken, apiFetch } from "@/lib/utils";
import type { GraphNode } from "@/lib/types";
import { confidenceToColor } from "@/lib/colors";
import { getAncestors } from "@/lib/graph";
import type { GraphNode as NebulaNode } from "@/components/graph/NebulaGraph";
import NebulaGraph from "@/components/graph/NebulaGraph";
import NodeDrawer from "@/components/NodeDrawer";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Upload, Loader2, X } from "lucide-react";

export default function CourseDetail() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    graphData,
    loading,
    selectedNode,
    fetchGraph,
    selectNode,
    updateMastery,
    setPollModalOpen,
    setGraphData,
    poll,
    pollLoading,
    pollError,
    pollModalOpen,
    generatePoll,
  } = useNebulaStore();

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login", { replace: true });
      return;
    }
    if (courseId) fetchGraph(courseId);
  }, [courseId, navigate, fetchGraph]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && courseId) fetchGraph(courseId);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [courseId, fetchGraph]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch(`/api/courses/${courseId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      } else {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        alert(err.detail || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleNodeClick = useCallback(
    (node: NebulaNode) => {
      const full = graphData?.nodes.find((n) => n.id === node.id);
      if (full) selectNode(full as GraphNode);
    },
    [selectNode, graphData?.nodes]
  );

  const MAX_DISPLAY_NODES = 10;
  const displayGraph = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) return null;
    if (graphData.nodes.length <= MAX_DISPLAY_NODES) return graphData;
    const linkCount = new Map<string, number>();
    graphData.nodes.forEach((n) => linkCount.set(n.id, 0));
    graphData.links.forEach((link) => {
      const s = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const t = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
      linkCount.set(s, (linkCount.get(s) ?? 0) + 1);
      linkCount.set(t, (linkCount.get(t) ?? 0) + 1);
    });
    const sorted = [...graphData.nodes].sort(
      (a, b) => (linkCount.get(b.id) ?? 0) - (linkCount.get(a.id) ?? 0)
    );
    const kept = new Set(sorted.slice(0, MAX_DISPLAY_NODES).map((n) => n.id));
    const nodes = graphData.nodes.filter((n) => kept.has(n.id));
    const links = graphData.links.filter((link) => {
      const s = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const t = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
      return kept.has(s) && kept.has(t);
    });
    return { ...graphData, nodes, links };
  }, [graphData]);

  const nebulaNodes: NebulaNode[] = useMemo(() => {
    if (!displayGraph) return [];
    return displayGraph.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      color: confidenceToColor(n.confidence),
      confidence: n.confidence,
      description: n.description,
      category: n.concept_type,
    }));
  }, [displayGraph]);

  const nebulaEdges = useMemo(() => {
    if (!displayGraph) return [];
    return displayGraph.links.map((link) => ({
      source: typeof link.source === "string" ? link.source : (link.source as GraphNode).id,
      target: typeof link.target === "string" ? link.target : (link.target as GraphNode).id,
    }));
  }, [displayGraph]);

  const highlightedNodeIds = useMemo(() => {
    if (!selectedNode) return undefined;
    const set = new Set(getAncestors(selectedNode.id, nebulaEdges));
    set.add(selectedNode.id);
    return set;
  }, [selectedNode?.id, nebulaEdges]);

  const hasGraph = displayGraph && displayGraph.nodes.length > 0;
  const dynamicMastery =
    graphData && graphData.nodes.length > 0
      ? Math.round(
          (graphData.nodes.reduce((acc, n) => acc + n.confidence, 0) / graphData.nodes.length) * 100
        )
      : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      <BackgroundCanvas />
      
      {/* Floating Header - glassmorphism */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-4 rounded-full border border-white/20 bg-white/[0.05] p-2 pr-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={() => navigate("/courses")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-bold leading-tight tracking-wide uppercase text-white">
            {graphData?.course?.name || "Initializing..."}
          </h1>
          <div className="mt-0.5 flex items-center gap-1.5">
            <BrainCircuit className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium tracking-wide text-white">{dynamicMastery}% Mastered</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/20 hover:text-white hover:border-white/50 backdrop-blur-md shadow-inner transition-all tracking-wide"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            {uploading ? "Analyzing..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      {/* Main canvas - NebulaGraph */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : !hasGraph ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/[0.05] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-1 text-lg font-medium text-white tracking-wide uppercase">Upload Course Material</h2>
              <p className="mb-6 max-w-sm text-sm text-white/70">
                Upload a PDF to generate your knowledge graph.
              </p>
              <Button
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-md transition-all tracking-wide shadow-inner"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Analyzing..." : "Select PDF"}
              </Button>
            </div>
          </div>
        ) : (
          <NebulaGraph
            nodes={nebulaNodes}
            edges={nebulaEdges}
            activeConceptId={selectedNode?.id ?? null}
            highlightedNodeIds={highlightedNodeIds}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      <NodeDrawer />

      {pollModalOpen && createPortal(
        <PollModal
          poll={poll}
          loading={pollLoading}
          error={pollError}
          nodeId={selectedNode?.id ?? ""}
          onClose={() => setPollModalOpen(false)}
          onRetry={() => {
            if (selectedNode) generatePoll(selectedNode.id);
            else setPollModalOpen(false);
          }}
          onResult={async (evalResult, problem) => {
            setPollModalOpen(false);
            if (selectedNode) {
              await updateMastery(selectedNode.id, evalResult, problem);
            }
          }}
        />,
        document.body
      )}
    </div>
  );
}

function PollModal({
  poll,
  loading,
  error,
  nodeId,
  onClose,
  onRetry,
  onResult,
}: {
  poll: { question: string; options: string[]; correct_answer: string } | null;
  loading: boolean;
  error: string | null;
  nodeId: string;
  onClose: () => void;
  onRetry: () => void;
  onResult: (evalResult: string, problem?: { question: string; options: string[]; correct_answer: string; user_answer: string }) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const onRetryRef = useRef(onRetry);
  const onCloseRef = useRef(onClose);
  onRetryRef.current = onRetry;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!loading && !error && !poll) {
      if (nodeId) onRetryRef.current();
      else onCloseRef.current();
    }
  }, [loading, error, poll, nodeId]);

  const handleSubmit = () => {
    if (!selected || !poll) return;
    const isCorrect = selected === poll.correct_answer;
    setShowResult(true);
    const problem = { question: poll.question, options: poll.options || [], correct_answer: poll.correct_answer, user_answer: selected };
    setTimeout(() => onResult(isCorrect ? "correct" : "wrong", problem), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md flex-shrink-0 rounded-2xl border border-white/20 bg-white/[0.05] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {loading || (!poll && !error) ? (
          <div className="flex min-h-32 items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="ml-3 text-sm text-white/70 tracking-wide uppercase">Generating question...</span>
          </div>
        ) : error ? (
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-medium tracking-wide text-white">Could not generate question</h3>
            <p className="text-sm text-white/70">{error}</p>
            <div className="flex gap-2">
              <Button
                className="h-10 flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/50"
                onClick={onRetry}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                className="h-10 flex-1 border-white/20 bg-white/[0.03] text-white hover:bg-white/10 hover:border-white/40"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 pr-4 text-sm font-medium leading-relaxed text-white tracking-wide">
                {poll!.question}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6 space-y-3">
              {poll!.options?.map((opt: string, i: number) => {
                const letter = opt[0];
                const isThis = selected === letter;
                const isCorrectAnswer = showResult && letter === poll!.correct_answer;
                const isWrongSelected = showResult && isThis && letter !== poll!.correct_answer;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !showResult && setSelected(letter)}
                    disabled={showResult}
                    className={`w-full min-h-12 flex-shrink-0 rounded-xl border p-4 text-left text-sm transition-all tracking-wide shadow-sm backdrop-blur-md ${
                      isCorrectAnswer
                        ? "border-white/50 bg-white/20 text-white"
                        : isWrongSelected
                          ? "border-red-500/50 bg-red-500/20 text-white"
                          : isThis
                            ? "border-white/50 bg-white/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/30 hover:bg-white/[0.08]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {!showResult && (
              <Button
                className="h-12 w-full flex-shrink-0 bg-white/10 border border-white/20 text-sm font-medium tracking-widest uppercase text-white hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:border-white/20 backdrop-blur-md"
                onClick={handleSubmit}
                disabled={!selected}
              >
                Submit Answer
              </Button>
            )}
            {showResult && (
              <div
                className={`py-3 rounded-lg backdrop-blur-md text-center text-sm font-medium tracking-wide uppercase ${
                  selected === poll!.correct_answer ? "bg-white/20 text-white border border-white/30" : "bg-red-500/20 text-red-100 border border-red-500/30"
                }`}
              >
                {selected === poll!.correct_answer
                  ? "Correct! Mastery updated."
                  : `Wrong. Correct answer: ${poll!.correct_answer}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
