import { useGraphStore } from '@/store/graphStore';
import { getResourcesForNode } from '@/data/sampleGraph';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Video, FileText, Code, ClipboardCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const resourceIcon = {
  video: Video,
  article: FileText,
  practice: Code,
} as const;

export function NodeDetails() {
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const simulateMastery = useGraphStore((s) => s.simulateMastery);
  const updateNodeConfidence = useGraphStore((s) => s.updateNodeConfidence);

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: STATUS_COLORS[selectedNode.status] }}
              />
              <h3 className="font-semibold text-sm text-gray-900">{selectedNode.label}</h3>
              <span className="text-xs text-gray-500 font-medium">
                ({STATUS_LABELS[selectedNode.status]})
              </span>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="rounded-sm p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-4 max-h-[320px] overflow-y-auto">
            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedNode.description}
            </p>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Confidence Level</span>
                <span className="font-semibold text-gray-700">
                  {Math.round(selectedNode.confidence * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${selectedNode.confidence * 100}%`,
                    backgroundColor: STATUS_COLORS[selectedNode.status],
                  }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                Recommended Resources
              </h4>
              <ul className="space-y-1.5">
                {getResourcesForNode(selectedNode.id).map((r, i) => {
                  const Icon = resourceIcon[r.type];
                  return (
                    <li
                      key={i}
                      className="group flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors cursor-pointer rounded-lg px-2.5 py-2 hover:bg-blue-50 border border-transparent hover:border-blue-100"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-500" />
                      <span className="flex-1 font-medium">{r.title}</span>
                      {r.duration && (
                        <span className="text-[10px] text-gray-400 group-hover:text-blue-400 font-mono">
                          {r.duration}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8 bg-white"
                onClick={() => {
                  const result = Math.random() > 0.5 ? 'correct' : 'wrong';
                  simulateMastery(selectedNode.id, result);
                }}
              >
                <ClipboardCheck className="h-3.5 w-3.5 text-gray-500" />
                Quick Poll
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => updateNodeConfidence(selectedNode.id, 1)}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mastered
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
