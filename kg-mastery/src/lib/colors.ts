export const COLOR_HEX = {
  active: "#3b82f6", // blue
};

export function confidenceToNodeFill(confidence: number) {
  if (confidence >= 0.8) return "#bbf7d0"; // green-200 (Mastered)
  if (confidence >= 0.6) return "#d9f99d"; // lime-200 (On Track)
  if (confidence >= 0.4) return "#fef08a"; // yellow-200 (Building)
  if (confidence > 0) return "#fed7aa";    // orange-200 (Developing)
  return "#e2e8f0";                        // slate-200 (Not Started)
}

export function confidenceToNodeBorder(confidence: number) {
  if (confidence >= 0.8) return "#4ade80"; // green-400
  if (confidence >= 0.6) return "#a3e635"; // lime-400
  if (confidence >= 0.4) return "#facc15"; // yellow-400
  if (confidence > 0) return "#fb923c";    // orange-400
  return "#94a3b8";                        // slate-400
}
