import { useState } from "react";
import { useNebulaStore } from "@/store/nebulaStore";
import type { SolvedProblem } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlayCircle, ExternalLink, ShieldCheck, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";

function SolvedQuestionCard({ sp }: { sp: SolvedProblem }) {
  const [expanded, setExpanded] = useState(false);
  const options = Array.isArray(sp.options) ? sp.options : [];
  return (
      <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden backdrop-blur-md">
          <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-white/[0.05] transition-colors"
          >
              <p className="text-xs text-white/90 leading-snug line-clamp-2 flex-1 min-w-0">
                  {sp.question}
              </p>
              <span
                  className={`text-[9px] font-semibold uppercase shrink-0 ${
                      sp.eval_result === "correct"
                          ? "text-emerald-400"
                          : sp.eval_result === "partial"
                            ? "text-yellow-400"
                            : "text-red-400"
                  }`}
              >
                  {sp.eval_result}
              </span>
              {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
              ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
              )}
          </button>
          {expanded && (
              <div className="px-3 pb-3 pt-0 border-t border-white/10 space-y-2 bg-black/20">
                  <p className="text-xs text-white/90 leading-relaxed pt-2">
                      {sp.question}
                  </p>
                  {options.length > 0 && (
                      <div className="space-y-1">
                          <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Options</span>
                          <ul className="text-xs text-white/80 space-y-0.5">
                              {options.map((opt, i) => (
                                  <li key={i}>{opt}</li>
                              ))}
                          </ul>
                      </div>
                  )}
                  <div className="text-[10px] space-y-1 mt-2 p-2 bg-white/5 rounded">
                      <p><span className="text-white/50">Your answer:</span> <span className="text-white/90">{sp.user_answer || "—"}</span></p>
                      <p><span className="text-white/50">Correct answer:</span> <span className="text-emerald-400">{sp.correct_answer || "—"}</span></p>
                  </div>
                  {sp.created_at && (
                      <p className="text-[10px] text-white/40 pt-1">{new Date(sp.created_at).toLocaleDateString()}</p>
                  )}
              </div>
          )}
      </div>
  );
}

export default function NodeDrawer() {
  const selectedNode = useNebulaStore((s) => s.selectedNode);
  const selectNode = useNebulaStore((s) => s.selectNode);
  const resources = useNebulaStore((s) => s.resources);
  const resourcesLoading = useNebulaStore((s) => s.resourcesLoading);
  const pollLoading = useNebulaStore((s) => s.pollLoading);
  const generatePoll = useNebulaStore((s) => s.generatePoll);
  const updateMasteryDelta = useNebulaStore((s) => s.updateMasteryDelta);
  const solvedProblems = useNebulaStore((s) => s.solvedProblems);
  const solvedProblemsLoading = useNebulaStore((s) => s.solvedProblemsLoading);

  const node = selectedNode;

  if (!node) return null;

  let badgeText = "⚪ Unseen";
  let badgeClass = "bg-white/10 text-white border-white/20";
  if (node.confidence > 0 && node.confidence < 0.4) {
    badgeText = "🔴 Struggling";
    badgeClass = "bg-red-500/20 text-red-100 border-red-500/40";
  } else if (node.confidence >= 0.4 && node.confidence < 0.7) {
    badgeText = "🟡 Exposed";
    badgeClass = "bg-yellow-500/20 text-yellow-100 border-yellow-500/40";
  } else if (node.confidence >= 0.7) {
    badgeText = "🟢 Mastered";
    badgeClass = "bg-white/20 text-white border-white/40";
  }

  return (
    <Sheet open={!!selectedNode} onOpenChange={(open) => !open && selectNode(null)}>
      <SheetContent className="flex flex-col border-white/20 bg-black/40 p-0 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-3xl sm:max-w-md">
        <div className="flex-1 overflow-y-auto p-8">
          <SheetHeader className="mb-8 space-y-4">
            <div
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide shadow-inner ${badgeClass}`}
            >
              {badgeText}
            </div>
            <SheetTitle className="text-3xl font-medium tracking-wide uppercase text-white">
              {node.label}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-10">
            <div className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/60">
                Concept Definition
              </h4>
              <p className="leading-relaxed text-white/90 text-sm tracking-wide">{node.description}</p>
            </div>

            {(resources.length > 0 || resourcesLoading) && (
              <div className="space-y-4">
                <h4 className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
                  Targeted Resources
                </h4>
                {resourcesLoading ? (
                  <div className="flex items-center gap-3 text-sm text-white/70 tracking-wide uppercase">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading resources...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/30 hover:bg-white/[0.08] shadow-inner backdrop-blur-md"
                      >
                        {r.type === "video" ? (
                          <PlayCircle className="mr-3 h-6 w-6 shrink-0 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                          <FileText className="mr-3 h-6 w-6 shrink-0 text-white group-hover:scale-110 transition-transform" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-white/90 transition-colors group-hover:text-white tracking-wide">
                            {r.title}
                          </p>
                          <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{r.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-white/30 group-hover:text-white/70 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
                Questions you've solved
              </h4>
              {solvedProblemsLoading ? (
                <div className="flex items-center gap-3 text-sm text-white/70 tracking-wide uppercase">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : solvedProblems.length === 0 ? (
                <p className="text-sm text-white/40">
                  No questions yet. Generate a question to test your knowledge!
                </p>
              ) : (
                <div className="space-y-3">
                  {solvedProblems.map((sp) => (
                    <SolvedQuestionCard key={sp.id} sp={sp} />
                  ))}
                </div>
              )}
            </div>

            <div className="h-24" />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          <Button
            className="mb-4 h-12 w-full font-medium tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/50 backdrop-blur-md"
            onClick={() => generatePoll(node.id)}
            disabled={pollLoading}
          >
            {pollLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-5 w-5" />
            )}
            Generate Question
          </Button>

          <div className="space-y-3">
            <p className="text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
              Dev Controls
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/10 bg-white/[0.02] text-xs font-medium text-white hover:border-white/40 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all"
                onClick={() => updateMasteryDelta(node.id, 0.5)}
              >
                +0.5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/10 bg-white/[0.02] text-xs font-medium text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/20 hover:text-yellow-300 backdrop-blur-sm transition-all"
                onClick={() => updateMasteryDelta(node.id, 0.2)}
              >
                +0.2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/10 bg-white/[0.02] text-xs font-medium text-red-400 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300 backdrop-blur-sm transition-all"
                onClick={() => updateMasteryDelta(node.id, -0.2)}
              >
                -0.2
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
