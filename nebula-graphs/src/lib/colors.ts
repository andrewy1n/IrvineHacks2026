export const COLOR_HEX: Record<string, string> = {
    gray: "#8E8E93",      // Apple System Gray
    red: "#FF3B30",       // Apple System Red
    yellow: "#FFCC00",    // Apple System Yellow
    green: "#34C759",     // Apple System Green
    active: "#0A84FF",    // Apple System Blue
};

export function confidenceToColor(confidence: number): string {
    if (confidence === 0) return "gray";
    if (confidence < 0.4) return "red";
    if (confidence < 0.7) return "yellow";
    return "green";
}

export function confidenceToFill(confidence: number): string {
    if (confidence === 0) return "#e2e8f0";     // slate-200 (unvisited)
    if (confidence < 0.2) return "#fecaca";     // red-200
    if (confidence < 0.4) return "#fed7aa";     // orange-200
    if (confidence < 0.55) return "#fef08a";   // yellow-200
    if (confidence < 0.7) return "#d9f99d";    // lime-200
    if (confidence < 0.85) return "#bbf7d0";   // green-200
    return "#86efac";                            // green-300
}

// 4-bucket node fill for the student knowledge graph (matches heatmap visual bands)
export function confidenceToNodeFill(confidence: number): string {
    if (confidence === 0) return "#8E8E93";     // Gray (not started)
    if (confidence < 0.4) return "#FF3B30";     // Red (struggling)
    if (confidence < 0.55) return "#FF9500";   // Orange (partial)
    if (confidence < 0.7) return "#FFCC00";    // Yellow (good)
    return "#34C759";                            // Green (mastered)
}

// 4-bucket node border for the student knowledge graph
export function confidenceToNodeBorder(confidence: number): string {
    if (confidence === 0) return "#8E8E93";    // Gray
    if (confidence < 0.4) return "#FF3B30";    // Red
    if (confidence < 0.55) return "#FF9500";   // Orange
    if (confidence < 0.7) return "#FFCC00";    // Yellow
    return "#34C759";                          // Green
}

// Dark theme: node fill (subtle on #0a0a0a)
export function confidenceToNodeFillDark(confidence: number): string {
    if (confidence === 0) return "rgba(142,142,147,0.12)"; // Gray rgb(142, 142, 147)
    if (confidence < 0.4) return "rgba(255,59,48,0.12)";   // Red rgb(255, 59, 48)
    if (confidence < 0.55) return "rgba(255,149,0,0.12)";  // Orange rgb(255, 149, 0)
    if (confidence < 0.7) return "rgba(255,204,0,0.12)";   // Yellow rgb(255, 204, 0)
    return "rgba(52,199,89,0.15)";                           // Green rgb(52, 199, 89)
}
