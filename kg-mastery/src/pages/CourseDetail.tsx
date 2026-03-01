import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNebulaStore } from "@/store/nebulaStore";
import { getAuthToken, apiFetch } from "@/lib/utils";
import type { GraphNode } from "@/lib/types";
import { confidenceToColor } from "@/lib/colors";
import { getAncestors } from "@/lib/graph";
import type { GraphNode as KGNode } from "@/components/graph/KnowledgeGraph";
import KnowledgeGraph from "@/components/graph/KnowledgeGraph";
import NodeDrawer from "@/components/NodeDrawer";
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
    pollModalOpen,
  } = useNebulaStore();

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login", { replace: true });
      return;
    }
    if (courseId) fetchGraph(courseId);
  }, [courseId, navigate, fetchGraph]);

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
    (node: KGNode) => {
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

  const kgNodes: KGNode[] = useMemo(() => {
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

  const kgEdges = useMemo(() => {
    if (!displayGraph) return [];
    return displayGraph.links.map((link) => ({
      source: typeof link.source === "string" ? link.source : (link.source as GraphNode).id,
      target: typeof link.target === "string" ? link.target : (link.target as GraphNode).id,
    }));
  }, [displayGraph]);

  const highlightedNodeIds = useMemo(() => {
    if (!selectedNode) return undefined;
    const set = new Set(getAncestors(selectedNode.id, kgEdges));
    set.add(selectedNode.id);
    return set;
  }, [selectedNode?.id, kgEdges]);

  const hasGraph = displayGraph && displayGraph.nodes.length > 0;
  const dynamicMastery =
    graphData && graphData.nodes.length > 0
      ? Math.round(
          (graphData.nodes.reduce((acc, n) => acc + n.confidence, 0) / graphData.nodes.length) * 100
        )
      : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      {/* Floating Header - neubla style */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-4 rounded-full border border-white/10 bg-zinc-950/60 p-2 pr-6 shadow-2xl backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={() => navigate("/courses")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-bold leading-tight tracking-tight text-white">
            {graphData?.course?.name || "Initializing..."}
          </h1>
          <div className="mt-0.5 flex items-center gap-1.5">
            <BrainCircuit className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{dynamicMastery}% Mastered</span>
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
            className="border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
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

      {/* Main canvas - keep existing KnowledgeGraph */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : !hasGraph ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Upload className="h-8 w-8 text-zinc-500" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-white">Upload Course Material</h2>
            <p className="mb-4 max-w-sm text-xs text-zinc-400">
              Upload a PDF to generate your knowledge graph.
            </p>
            <Button
              className="bg-cyan-600 text-white hover:bg-cyan-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Analyzing..." : "Select PDF"}
            </Button>
          </div>
        ) : (
          <KnowledgeGraph
            nodes={kgNodes}
            edges={kgEdges}
            activeConceptId={selectedNode?.id ?? null}
            highlightedNodeIds={highlightedNodeIds}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      <NodeDrawer />

      {pollModalOpen && (
        <PollModal
          poll={poll}
          loading={pollLoading}
          nodeId={selectedNode?.id ?? ""}
          onClose={() => setPollModalOpen(false)}
          onResult={(evalResult) => {
            if (selectedNode) updateMastery(selectedNode.id, evalResult);
            setPollModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PollModal({
  poll,
  loading,
  onClose,
  onResult,
}: {
  poll: { question: string; options: string[]; correct_answer: string } | null;
  loading: boolean;
  nodeId: string;
  onClose: () => void;
  onResult: (evalResult: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (!selected || !poll) return;
    const isCorrect = selected === poll.correct_answer;
    setShowResult(true);
    setTimeout(() => onResult(isCorrect ? "correct" : "wrong"), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md flex-shrink-0 rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        {loading || !poll ? (
          <div className="flex min-h-32 items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="ml-3 text-sm text-zinc-400">Generating question...</span>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 pr-4 text-sm font-bold leading-snug text-white">
                {poll.question}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 space-y-2">
              {poll.options?.map((opt: string, i: number) => {
                const letter = opt[0];
                const isThis = selected === letter;
                const isCorrectAnswer = showResult && letter === poll.correct_answer;
                const isWrongSelected = showResult && isThis && letter !== poll.correct_answer;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !showResult && setSelected(letter)}
                    disabled={showResult}
                    className={`w-full min-h-12 flex-shrink-0 rounded-lg border p-3 text-left text-xs transition-all ${
                      isCorrectAnswer
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                        : isWrongSelected
                          ? "border-red-500/50 bg-red-500/10 text-red-400"
                          : isThis
                            ? "border-cyan-500/30 bg-cyan-500/5 text-white"
                            : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {!showResult && (
              <Button
                className="h-11 w-full flex-shrink-0 bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-30"
                onClick={handleSubmit}
                disabled={!selected}
              >
                Submit Answer
              </Button>
            )}
            {showResult && (
              <div
                className={`py-2 text-center text-sm font-semibold ${
                  selected === poll.correct_answer ? "text-cyan-400" : "text-red-400"
                }`}
              >
                {selected === poll.correct_answer
                  ? "Correct! Mastery updated."
                  : `Wrong. Correct answer: ${poll.correct_answer}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
