import { useNebulaStore } from "@/store/nebulaStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlayCircle, ExternalLink, ShieldCheck, Loader2, FileText } from "lucide-react";

export default function NodeDrawer() {
  const selectedNode = useNebulaStore((s) => s.selectedNode);
  const selectNode = useNebulaStore((s) => s.selectNode);
  const resources = useNebulaStore((s) => s.resources);
  const resourcesLoading = useNebulaStore((s) => s.resourcesLoading);
  const pollLoading = useNebulaStore((s) => s.pollLoading);
  const generatePoll = useNebulaStore((s) => s.generatePoll);
  const updateMasteryDelta = useNebulaStore((s) => s.updateMasteryDelta);

  const node = selectedNode;

  if (!node) return null;

  let badgeText = "⚪ Unseen";
  let badgeClass = "bg-zinc-800 text-zinc-300 border-zinc-600";
  if (node.confidence > 0 && node.confidence < 0.4) {
    badgeText = "🔴 Struggling";
    badgeClass = "bg-red-500/10 text-red-500 border-red-500/30";
  } else if (node.confidence >= 0.4 && node.confidence < 0.7) {
    badgeText = "🟡 Exposed";
    badgeClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  } else if (node.confidence >= 0.7) {
    badgeText = "🟢 Mastered";
    badgeClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
  }

  return (
    <Sheet open={!!selectedNode} onOpenChange={(open) => !open && selectNode(null)}>
      <SheetContent className="flex flex-col border-white/10 bg-[#0a0a0b]/95 p-0 text-zinc-100 shadow-2xl backdrop-blur-xl sm:max-w-md">
        <div className="flex-1 overflow-y-auto p-6">
          <SheetHeader className="mb-6 space-y-4">
            <div
              className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {badgeText}
            </div>
            <SheetTitle className="text-3xl font-bold leading-tight tracking-tight text-white">
              {node.label}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                Concept Definition
              </h4>
              <p className="leading-relaxed text-zinc-400">{node.description}</p>
            </div>

            {(resources.length > 0 || resourcesLoading) && (
              <div className="space-y-3">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-200">
                  Targeted Resources
                </h4>
                {resourcesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading resources...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex cursor-pointer items-center rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10"
                      >
                        {r.type === "video" ? (
                          <PlayCircle className="mr-3 h-5 w-5 shrink-0 text-cyan-400" />
                        ) : (
                          <FileText className="mr-3 h-5 w-5 shrink-0 text-cyan-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-cyan-300">
                            {r.title}
                          </p>
                          <p className="text-xs text-zinc-500">{r.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-20" />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <Button
            className="mb-4 h-12 w-full font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] bg-cyan-600 hover:bg-cyan-500"
            onClick={() => generatePoll(node.id)}
            disabled={pollLoading}
          >
            {pollLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-5 w-5" />
            )}
            Verify Mastery (Take Poll)
          </Button>

          <div className="space-y-2">
            <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Dev Controls
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/5 text-xs text-emerald-500 hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                onClick={() => updateMasteryDelta(node.id, 0.5)}
              >
                +0.5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/5 text-xs text-yellow-500 hover:border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-400"
                onClick={() => updateMasteryDelta(node.id, 0.2)}
              >
                +0.2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-white/5 text-xs text-red-500 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
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
