"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useNebulaStore } from "@/store/nebulaStore";
import { getAuthToken, apiFetch, getStatusFromConfidence } from "@/lib/utils";
import type { GraphNode, SolvedProblem } from "@/lib/types";
import { confidenceToColor } from "@/lib/colors";
import { getAncestors } from "@/lib/graph";
import type { GraphNode as KGNode } from "@/components/graph/KnowledgeGraph";
import KnowledgeGraph from "@/components/graph/KnowledgeGraph";
import {
    Upload,
    X,
    Loader2,
    ExternalLink,
    Video,
    FileText,
    ThumbsUp,
    ThumbsDown,
    Eye,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const COLOR_HEX: Record<string, string> = {
    gray: "#94a3b8",
    red: "#fb923c",
    yellow: "#facc15",
    green: "#4ade80",
};

function getNodeColor(confidence: number): string {
    if (confidence === 0) return COLOR_HEX.gray;
    if (confidence < 0.4) return COLOR_HEX.red;
    if (confidence < 0.7) return COLOR_HEX.yellow;
    return COLOR_HEX.green;
}

export default function CourseGraphPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = params.id as string;
    const isDev = searchParams.get("dev") === "true";

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const {
        graphData,
        loading,
        selectedNode,
        drawerOpen,
        resources,
        resourcesLoading,
        solvedProblems,
        solvedProblemsLoading,
        poll,
        pollLoading,
        pollModalOpen,
        fetchGraph,
        selectNode,
        closeDrawer,
        generatePoll,
        fetchSolvedProblems,
        updateMastery,
        updateMasteryDelta,
        setPollModalOpen,
        setGraphData,
    } = useNebulaStore();

    useEffect(() => {
        if (!getAuthToken()) {
            router.replace("/login");
            return;
        }
        fetchGraph(courseId);
    }, [courseId, router, fetchGraph]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible" && courseId) fetchGraph(courseId);
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [courseId, fetchGraph]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
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

    const displayGraph = useMemo(() => {
        if (!graphData || graphData.nodes.length === 0) return null;
        return graphData;
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

    const status = selectedNode ? getStatusFromConfidence(selectedNode.confidence) : null;
    const hasGraph = displayGraph && displayGraph.nodes.length > 0;

    return (
        <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
            <header className="flex items-center gap-4 px-4 py-2.5 border-b border-[#C5AE79]/15 bg-[#0a0a0a]/90 backdrop-blur-md z-50 shrink-0">
                <button
                    onClick={() => router.push("/courses")}
                    className="text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider text-[#C5AE79]/80">NEBULA</span>
                    <span className="text-[#C5AE79]/20">|</span>
                    <span className="text-sm font-semibold text-[#C5AE79] truncate max-w-[300px]">
                        {graphData?.course?.name || "Loading..."}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-[#C5AE79]/10 border border-[#C5AE79]/30 text-[#C5AE79] rounded-lg hover:bg-[#C5AE79]/20 transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Upload className="w-3.5 h-3.5" />
                        )}
                        {uploading ? "Analyzing..." : "Upload PDF"}
                    </button>
                </div>
            </header>

            <div className="flex-1 relative min-h-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C5AE79]" />
                    </div>
                ) : !hasGraph ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                        <div className="w-16 h-16 rounded-2xl bg-[#C5AE79]/10 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-[#C5AE79]/50" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#C5AE79] mb-1">
                            Upload Course Material
                        </h2>
                        <p className="text-xs text-[#C5AE79]/50 max-w-sm mb-4">
                            Upload a PDF (syllabus, slides, or textbook) to generate your knowledge
                            graph.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="h-10 px-5 bg-[#C5AE79] text-[#0a0a0a] font-semibold text-sm rounded-lg shadow-[0_0_20px_rgba(197,174,121,0.3)] disabled:opacity-50"
                        >
                            {uploading ? "Analyzing..." : "Select PDF"}
                        </button>
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

                {drawerOpen && selectedNode && (
                    <div className="absolute top-0 right-0 h-full w-80 bg-[#111]/95 border-l border-[#C5AE79]/15 backdrop-blur-xl z-40 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-start justify-between p-4 border-b border-[#C5AE79]/15">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{status?.emoji}</span>
                                    <span
                                        className="text-[10px] font-semibold uppercase tracking-wider"
                                        style={{ color: getNodeColor(selectedNode.confidence) }}
                                    >
                                        {status?.label}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-[#C5AE79] truncate">
                                    {selectedNode.label}
                                </h3>
                                <span className="text-[10px] text-[#C5AE79]/40 capitalize">
                                    {selectedNode.concept_type}
                                </span>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-xs text-[#C5AE79]/70 leading-relaxed">
                                {selectedNode.description}
                            </p>
                            <div>
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-[#C5AE79]/50 font-medium">Confidence</span>
                                    <span className="font-bold text-[#C5AE79]">
                                        {Math.round(selectedNode.confidence * 100)}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-[#0a0a0a] rounded-full border border-[#C5AE79]/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${selectedNode.confidence * 100}%`,
                                            backgroundColor: getNodeColor(selectedNode.confidence),
                                            boxShadow: `0 0 8px ${getNodeColor(selectedNode.confidence)}`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-semibold text-[#C5AE79] uppercase tracking-wider mb-2">
                                    Recommended Resources
                                </h4>
                                {resourcesLoading ? (
                                    <div className="flex items-center gap-2 text-[#C5AE79]/40 text-xs py-3">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Loading resources...
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {resources.map((r, i) => (
                                            <a
                                                key={i}
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0a0a0a] border border-[#C5AE79]/10 hover:border-[#00ffff]/30 hover:bg-[#00ffff]/5 transition-all group"
                                            >
                                                {r.type === "video" ? (
                                                    <Video className="w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]" />
                                                ) : (
                                                    <FileText className="w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-[#C5AE79]/80 group-hover:text-[#C5AE79] truncate">
                                                        {r.title}
                                                    </p>
                                                    <p className="text-[10px] text-[#C5AE79]/40 mt-0.5 line-clamp-2">
                                                        {r.why}
                                                    </p>
                                                </div>
                                                <ExternalLink className="w-3 h-3 text-[#C5AE79]/20 shrink-0 group-hover:text-[#00ffff]" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-[10px] font-semibold text-[#C5AE79] uppercase tracking-wider mb-2">
                                    Questions you&apos;ve solved
                                </h4>
                                {solvedProblemsLoading ? (
                                    <div className="flex items-center gap-2 text-[#C5AE79]/40 text-xs py-3">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Loading...
                                    </div>
                                ) : solvedProblems.length === 0 ? (
                                    <p className="text-[10px] text-[#C5AE79]/40 py-2">
                                        No questions yet. Use Solve &amp; Sync or take a quick poll.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {solvedProblems.map((sp) => (
                                            <SolvedQuestionCard key={sp.id} sp={sp} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => generatePoll(selectedNode.id)}
                                disabled={pollLoading}
                                className="w-full h-9 bg-[#C5AE79]/15 border border-[#C5AE79]/30 text-[#C5AE79] text-xs font-semibold rounded-lg hover:bg-[#C5AE79]/25 transition-all disabled:opacity-50"
                            >
                                {pollLoading ? "Generating..." : "Generate Question"}
                            </button>
                            {isDev && (
                                <div className="pt-3 border-t border-[#C5AE79]/10 space-y-1.5">
                                    <p className="text-[9px] text-[#C5AE79]/30 uppercase tracking-widest font-mono mb-2">
                                        Dev Controls
                                    </p>
                                    <button
                                        onClick={() => updateMastery(selectedNode.id, "correct")}
                                        className="w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#00ffff]/30 text-[#00ffff] rounded-md hover:bg-[#00ffff]/10 transition-all"
                                    >
                                        <ThumbsUp className="w-3 h-3" /> Simulate Correct
                                    </button>
                                    <button
                                        onClick={() => updateMastery(selectedNode.id, "wrong")}
                                        className="w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#ff0055]/30 text-[#ff0055] rounded-md hover:bg-[#ff0055]/10 transition-all"
                                    >
                                        <ThumbsDown className="w-3 h-3" /> Simulate Wrong
                                    </button>
                                    <button
                                        onClick={() => updateMasteryDelta(selectedNode.id, 0.3)}
                                        className="w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#C5AE79]/30 text-[#C5AE79] rounded-md hover:bg-[#C5AE79]/10 transition-all"
                                    >
                                        <Eye className="w-3 h-3" /> Simulate Exposure (+30%)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {pollModalOpen && (
                    <PollModal
                        poll={poll}
                        loading={pollLoading}
                        nodeId={selectedNode?.id || ""}
                        onClose={() => setPollModalOpen(false)}
                        onResult={async (evalResult, problem) => {
                            setPollModalOpen(false);
                            if (selectedNode) {
                                await updateMastery(selectedNode.id, evalResult, problem);
                                if (problem) fetchSolvedProblems(selectedNode.id);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function SolvedQuestionCard({ sp }: { sp: SolvedProblem }) {
    const [expanded, setExpanded] = useState(false);
    const options = Array.isArray(sp.options) ? sp.options : [];
    return (
        <div className="rounded-lg bg-[#0a0a0a] border border-[#C5AE79]/10 overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-2.5 flex items-start justify-between gap-2 hover:bg-[#C5AE79]/5 transition-colors"
            >
                <p className="text-xs text-[#C5AE79]/90 leading-snug line-clamp-2 flex-1 min-w-0">
                    {sp.question}
                </p>
                <span
                    className={`text-[9px] font-semibold uppercase shrink-0 ${
                        sp.eval_result === "correct"
                            ? "text-[#00ffff]"
                            : sp.eval_result === "partial"
                              ? "text-[#C5AE79]"
                              : "text-[#ff0055]/80"
                    }`}
                >
                    {sp.eval_result}
                </span>
                {expanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#C5AE79]/50 shrink-0 mt-0.5" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#C5AE79]/50 shrink-0 mt-0.5" />
                )}
            </button>
            {expanded && (
                <div className="px-2.5 pb-2.5 pt-0 border-t border-[#C5AE79]/10 space-y-2">
                    <p className="text-xs text-[#C5AE79]/90 leading-relaxed pt-2">
                        {sp.question}
                    </p>
                    {options.length > 0 && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-medium text-[#C5AE79]/60 uppercase tracking-wider">Options</span>
                            <ul className="text-xs text-[#C5AE79]/80 space-y-0.5">
                                {options.map((opt, i) => (
                                    <li key={i}>{opt}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="text-[10px] space-y-1">
                        <p><span className="text-[#C5AE79]/50">Your answer:</span> <span className="text-[#C5AE79]/90">{sp.user_answer || "—"}</span></p>
                        <p><span className="text-[#C5AE79]/50">Correct answer:</span> <span className="text-[#00ffff]/90">{sp.correct_answer || "—"}</span></p>
                    </div>
                    {sp.created_at && (
                        <p className="text-[10px] text-[#C5AE79]/40">{new Date(sp.created_at).toLocaleDateString()}</p>
                    )}
                </div>
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
    poll: any;
    loading: boolean;
    nodeId: string;
    onClose: () => void;
    onResult: (evalResult: string, problem?: { question: string; options: string[]; correct_answer: string; user_answer: string }) => void;
}) {
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSubmit = () => {
        if (!selected || !poll) return;
        const isCorrect = selected === poll.correct_answer;
        setShowResult(true);
        const problem = { question: poll.question, options: poll.options || [], correct_answer: poll.correct_answer, user_answer: selected };
        setTimeout(() => onResult(isCorrect ? "correct" : "wrong", problem), 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-[#C5AE79]/20 rounded-2xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                {loading || !poll ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C5AE79]" />
                        <span className="ml-3 text-sm text-[#C5AE79]/60">Generating question...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#C5AE79] leading-snug pr-4">
                                {poll.question}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2 mb-5">
                            {poll.options?.map((opt: string, i: number) => {
                                const letter = opt[0];
                                const isThis = selected === letter;
                                const isCorrectAnswer = showResult && letter === poll.correct_answer;
                                const isWrongSelected =
                                    showResult && isThis && letter !== poll.correct_answer;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => !showResult && setSelected(letter)}
                                        disabled={showResult}
                                        className={`w-full text-left p-3 rounded-lg text-xs border transition-all ${
                                            isCorrectAnswer
                                                ? "border-[#00ffff]/50 bg-[#00ffff]/10 text-[#00ffff]"
                                                : isWrongSelected
                                                  ? "border-[#ff0055]/50 bg-[#ff0055]/10 text-[#ff0055]"
                                                  : isThis
                                                    ? "border-[#C5AE79]/50 bg-[#C5AE79]/10 text-[#C5AE79]"
                                                    : "border-[#C5AE79]/15 text-[#C5AE79]/70 hover:border-[#C5AE79]/30"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult && (
                            <button
                                onClick={handleSubmit}
                                disabled={!selected}
                                className="w-full h-9 bg-[#C5AE79] text-[#0a0a0a] text-xs font-bold rounded-lg disabled:opacity-30 transition-all"
                            >
                                Submit Answer
                            </button>
                        )}
                        {showResult && (
                            <div
                                className={`text-center text-sm font-semibold py-2 ${
                                    selected === poll.correct_answer
                                        ? "text-[#00ffff]"
                                        : "text-[#ff0055]"
                                }`}
                            >
                                {selected === poll.correct_answer
                                    ? "✅ Correct! Mastery updated."
                                    : `❌ Wrong. Correct answer: ${poll.correct_answer}`}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
