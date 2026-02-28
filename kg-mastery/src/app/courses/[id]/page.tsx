"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useNebulaStore } from "@/store/nebulaStore";
import { getAuthToken, apiFetch, getStatusFromConfidence } from "@/lib/utils";
import type { GraphNode } from "@/lib/types";
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
} from "lucide-react";

// Dynamic import for react-force-graph-2d (requires window)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
});

// Canvas drawing helpers
const GOLD = "#C5AE79";
const CYAN = "#00ffff";
const RED = "#ff0055";
const GREY = "rgba(255,255,255,0.25)";

function getNodeColor(confidence: number): string {
    if (confidence === 0) return GREY;
    if (confidence < 0.4) return RED;
    if (confidence < 0.7) return GOLD;
    return CYAN;
}

function getNodeGlowRadius(confidence: number): number {
    if (confidence === 0) return 0;
    if (confidence < 0.4) return 20;
    if (confidence < 0.7) return 14;
    return 25;
}

// Dynamic node radius: ensures the circle is at least large enough to fit the longest word
const FONT_WIDTH_ESTIMATE = 6.5; // approx px per char at ~11px bold font
const NODE_PADDING = 14;         // px padding inside circle
const BASE_RADIUS = 28;          // minimum radius

function getNodeRadius(label: string, confidence: number): number {
    // Find the longest word in the label
    const longestWord = label.split(/[\s\-\/]+/).reduce(
        (a, b) => (a.length > b.length ? a : b),
        ""
    );
    const minRadiusForWord = (longestWord.length * FONT_WIDTH_ESTIMATE + NODE_PADDING) / 2;
    const baseForState = confidence === 0 ? BASE_RADIUS * 0.75 : BASE_RADIUS;
    return Math.max(baseForState, minRadiusForWord);
}

export default function CourseGraphPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = params.id as string;
    const isDev = searchParams.get("dev") === "true";

    const graphRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [pulsePhase, setPulsePhase] = useState(0);

    const {
        graphData,
        loading,
        selectedNode,
        drawerOpen,
        resources,
        resourcesLoading,
        poll,
        pollLoading,
        pollModalOpen,
        fetchGraph,
        selectNode,
        closeDrawer,
        generatePoll,
        updateMastery,
        updateMasteryDelta,
        setPollModalOpen,
        setGraphData,
    } = useNebulaStore();

    // Auth guard
    useEffect(() => {
        if (!getAuthToken()) {
            router.replace("/login");
            return;
        }
        fetchGraph(courseId);
    }, [courseId, router, fetchGraph]);

    // Pulse animation for Exposed (gold) nodes
    useEffect(() => {
        const interval = setInterval(() => {
            setPulsePhase((p) => (p + 0.05) % (Math.PI * 2));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // PDF Upload
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

    // Node click handler
    const handleNodeClick = useCallback(
        (node: any) => {
            selectNode(node as GraphNode);
        },
        [selectNode]
    );

    // Canvas node rendering
    const nodeCanvasObject = useCallback(
        (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const confidence = node.confidence ?? 0;
            const color = getNodeColor(confidence);
            const glowRadius = getNodeGlowRadius(confidence);
            const label = node.label || "";
            const isSelected = selectedNode?.id === node.id;
            const baseRadius = getNodeRadius(label, confidence);

            // Pulsing for Exposed (gold) and Gap (red) nodes
            let pulse = 1;
            if (confidence >= 0.4 && confidence < 0.7) {
                pulse = 1 + 0.06 * Math.sin(pulsePhase);
            } else if (confidence > 0 && confidence < 0.4) {
                pulse = 1 + 0.04 * Math.sin(pulsePhase * 1.5);
            }

            const radius = baseRadius * pulse;

            // Outer glow layer
            if (glowRadius > 0) {
                ctx.save();
                ctx.shadowColor = color;
                ctx.shadowBlur = glowRadius * (isSelected ? 2.5 : 1);
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.restore();
            }

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

            if (confidence === 0) {
                // Unseen: outlined grey with subtle fill
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
                ctx.fill();
            } else {
                // Darker fill with colored border for readability
                ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            // Selected ring
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Label INSIDE the circle — word wrap if needed
            const fontSize = Math.max(11 / globalScale, 4);
            ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = confidence === 0
                ? "rgba(255,255,255,0.5)"
                : isSelected ? "#ffffff" : color;

            // Simple word wrap for labels that are wider than the circle
            const maxWidth = radius * 1.7;
            const words = label.split(/\s+/);
            const lines: string[] = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + " " + words[i];
                if (ctx.measureText(testLine).width > maxWidth) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);

            const lineHeight = fontSize * 1.25;
            const startY = node.y - ((lines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], node.x, startY + i * lineHeight);
            }
        },
        [selectedNode, pulsePhase]
    );

    // Pointer area for click detection (matches visual size)
    const nodePointerAreaPaint = useCallback(
        (node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const label = node.label || "";
            const confidence = node.confidence ?? 0;
            const radius = getNodeRadius(label, confidence);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
        },
        []
    );

    // Custom link rendering
    const linkCanvasObject = useCallback(
        (link: any, ctx: CanvasRenderingContext2D) => {
            const source = link.source;
            const target = link.target;
            if (!source || !target || typeof source === "string" || typeof target === "string") return;

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(197, 174, 121, 0.15)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        },
        []
    );

    const status = selectedNode ? getStatusFromConfidence(selectedNode.confidence) : null;

    const hasGraph = graphData && graphData.nodes.length > 0;

    return (
        <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <header className="flex items-center gap-4 px-4 py-2.5 border-b border-[#C5AE79]/15 bg-[#0a0a0a]/90 backdrop-blur-md z-50 shrink-0">
                <button
                    onClick={() => router.push("/courses")}
                    className="text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider text-[#C5AE79]/80">
                        NEBULA
                    </span>
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

            {/* Main Content */}
            <div className="flex-1 relative min-h-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C5AE79]" />
                    </div>
                ) : !hasGraph ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#C5AE79]/10 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-[#C5AE79]/50" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#C5AE79] mb-1">
                            Upload Course Material
                        </h2>
                        <p className="text-xs text-[#C5AE79]/50 max-w-sm mb-4">
                            Upload a PDF (syllabus, slides, or textbook) to generate your knowledge graph.
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
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={{
                            nodes: graphData.nodes,
                            links: graphData.links,
                        }}
                        nodeCanvasObject={nodeCanvasObject}
                        nodePointerAreaPaint={nodePointerAreaPaint}
                        linkCanvasObject={linkCanvasObject}
                        onNodeClick={handleNodeClick}
                        backgroundColor="#0a0a0a"
                        nodeRelSize={28}
                        linkWidth={0.8}
                        linkColor={() => "rgba(197, 174, 121, 0.15)"}
                        cooldownTicks={100}
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                        enableNodeDrag={true}
                        enableZoomInteraction={true}
                        enablePanInteraction={true}
                    />
                )}

                {/* Legend */}
                {hasGraph && (
                    <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-[#111]/90 border border-[#C5AE79]/15 backdrop-blur-md z-40">
                        <div className="flex flex-col gap-2 text-[10px] text-[#C5AE79]/70 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full border border-white/30" />
                                <span>Unseen</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ff0055] shadow-[0_0_6px_#ff0055]" />
                                <span className="text-[#ff0055]">Struggling</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#C5AE79] shadow-[0_0_6px_#C5AE79]" />
                                <span>Exposed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_6px_#00ffff]" />
                                <span className="text-[#00ffff]">Mastered</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Drawer */}
                {drawerOpen && selectedNode && (
                    <div className="absolute top-0 right-0 h-full w-80 bg-[#111]/95 border-l border-[#C5AE79]/15 backdrop-blur-xl z-40 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
                        {/* Drawer Header */}
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

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Description */}
                            <p className="text-xs text-[#C5AE79]/70 leading-relaxed">
                                {selectedNode.description}
                            </p>

                            {/* Confidence Bar */}
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

                            {/* Resources */}
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

                            {/* Take Poll Button */}
                            <button
                                onClick={() => generatePoll(selectedNode.id)}
                                disabled={pollLoading}
                                className="w-full h-9 bg-[#C5AE79]/15 border border-[#C5AE79]/30 text-[#C5AE79] text-xs font-semibold rounded-lg hover:bg-[#C5AE79]/25 transition-all disabled:opacity-50"
                            >
                                {pollLoading ? "Generating..." : "🎯 Take Quick Poll"}
                            </button>

                            {/* Dev Buttons */}
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

                {/* Poll Modal */}
                {pollModalOpen && (
                    <PollModal
                        poll={poll}
                        loading={pollLoading}
                        nodeId={selectedNode?.id || ""}
                        onClose={() => setPollModalOpen(false)}
                        onResult={(evalResult) => {
                            if (selectedNode) {
                                updateMastery(selectedNode.id, evalResult);
                            }
                            setPollModalOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Poll Modal Component
function PollModal({
    poll,
    loading,
    nodeId,
    onClose,
    onResult,
}: {
    poll: any;
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
        setTimeout(() => {
            onResult(isCorrect ? "correct" : "wrong");
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-[#C5AE79]/20 rounded-2xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                {loading || !poll ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C5AE79]" />
                        <span className="ml-3 text-sm text-[#C5AE79]/60">
                            Generating question...
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#C5AE79] leading-snug pr-4">
                                {poll.question}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] transition-colors shrink-0"
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
                                        className={`w-full text-left p-3 rounded-lg text-xs border transition-all ${isCorrectAnswer
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
                                className={`text-center text-sm font-semibold py-2 ${selected === poll.correct_answer ? "text-[#00ffff]" : "text-[#ff0055]"}`}
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
