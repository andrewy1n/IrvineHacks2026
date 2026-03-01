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
    if (confidence < 0.6) return "#fef08a";     // yellow-200
    if (confidence < 0.8) return "#d9f99d";     // lime-200
    if (confidence < 1.0) return "#bbf7d0";     // green-200
    return "#22c55e";                            // deep green
}

// 5-bucket node fill for the student knowledge graph (matches 4-tier system)
export function confidenceToNodeFill(confidence: number): string {
    if (confidence === 0) return "#8E8E93";     // Gray (not started)
    if (confidence < 0.4) return "#FF3B30";     // Red (struggling)
    if (confidence < 0.6) return "#FFCC00";     // Yellow (exposure)
    if (confidence < 0.8) return "#34C759";     // Light Green (recall)
    if (confidence < 1.0) return "#28a745";     // Green (synthesis)
    return "#059669";                           // Deep Green (feynman)
}

// 5-bucket node border for the student knowledge graph
export function confidenceToNodeBorder(confidence: number): string {
    if (confidence === 0) return "#8E8E93";    // Gray
    if (confidence < 0.4) return "#FF3B30";    // Red
    if (confidence < 0.6) return "#FFCC00";    // Yellow
    if (confidence < 0.8) return "#34C759";    // Light Green
    if (confidence < 1.0) return "#28a745";    // Green
    return "#10b981";                          // Glowing Deep Green
}

// Dark theme: node fill (subtle on #0a0a0a)
export function confidenceToNodeFillDark(confidence: number): string {
    if (confidence === 0) return "rgba(142,142,147,0.12)"; // Gray rgb(142, 142, 147)
    if (confidence < 0.4) return "rgba(255,59,48,0.12)";   // Red rgb(255, 59, 48)
    if (confidence < 0.6) return "rgba(255,204,0,0.12)";   // Yellow rgb(255, 204, 0)
    if (confidence < 0.8) return "rgba(52,199,89,0.15)";   // Light Green
    if (confidence < 1.0) return "rgba(40,167,69,0.2)";    // Green
    return "rgba(16,185,129,0.3)";                         // Deep Green (feynman glow)
}
