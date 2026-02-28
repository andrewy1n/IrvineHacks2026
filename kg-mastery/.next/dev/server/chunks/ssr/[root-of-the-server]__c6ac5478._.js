module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BASE",
    ()=>API_BASE,
    "apiFetch",
    ()=>apiFetch,
    "clearAuthToken",
    ()=>clearAuthToken,
    "cn",
    ()=>cn,
    "getAuthToken",
    ()=>getAuthToken,
    "getStatusFromConfidence",
    ()=>getStatusFromConfidence,
    "setAuthToken",
    ()=>setAuthToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
function getStatusFromConfidence(confidence) {
    if (confidence === 0) return {
        label: "Unseen",
        emoji: "⚫",
        color: "grey"
    };
    if (confidence < 0.4) return {
        label: "Struggling",
        emoji: "🔴",
        color: "red"
    };
    if (confidence < 0.7) return {
        label: "Exposed",
        emoji: "🟡",
        color: "gold"
    };
    return {
        label: "Mastered",
        emoji: "🟢",
        color: "cyan"
    };
}
function getAuthToken() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function setAuthToken(token) {
    localStorage.setItem("nebula_token", token);
}
function clearAuthToken() {
    localStorage.removeItem("nebula_token");
}
async function apiFetch(path, options = {}) {
    const token = getAuthToken();
    const headers = {
        ...options.headers || {}
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });
    if (res.status === 401) {
        clearAuthToken();
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }
    return res;
}
}),
"[project]/src/store/nebulaStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNebulaStore",
    ()=>useNebulaStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
const useNebulaStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        graphData: null,
        loading: false,
        selectedNode: null,
        drawerOpen: false,
        resources: [],
        resourcesLoading: false,
        poll: null,
        pollLoading: false,
        pollModalOpen: false,
        fetchGraph: async (courseId)=>{
            set({
                loading: true
            });
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/courses/${courseId}/graph`);
                if (res.ok) {
                    const data = await res.json();
                    set({
                        graphData: data,
                        loading: false
                    });
                } else {
                    set({
                        loading: false
                    });
                }
            } catch  {
                set({
                    loading: false
                });
            }
        },
        selectNode: (node)=>{
            set({
                selectedNode: node,
                drawerOpen: !!node,
                resources: [],
                poll: null
            });
            if (node) {
                get().fetchResources(node.id);
            }
        },
        closeDrawer: ()=>set({
                drawerOpen: false,
                selectedNode: null
            }),
        fetchResources: async (conceptId)=>{
            set({
                resourcesLoading: true
            });
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/concepts/${conceptId}/resources`);
                if (res.ok) {
                    const data = await res.json();
                    set({
                        resources: data,
                        resourcesLoading: false
                    });
                } else {
                    set({
                        resourcesLoading: false
                    });
                }
            } catch  {
                set({
                    resourcesLoading: false
                });
            }
        },
        generatePoll: async (conceptId)=>{
            set({
                pollLoading: true,
                pollModalOpen: true
            });
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/concepts/${conceptId}/poll`, {
                    method: "POST"
                });
                if (res.ok) {
                    const data = await res.json();
                    set({
                        poll: data,
                        pollLoading: false
                    });
                } else {
                    set({
                        pollLoading: false
                    });
                }
            } catch  {
                set({
                    pollLoading: false
                });
            }
        },
        updateMastery: async (conceptId, evalResult)=>{
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/mastery/${conceptId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        eval_result: evalResult
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    // Update the node confidence in the graph
                    set((state)=>{
                        if (!state.graphData) return {};
                        const nodes = state.graphData.nodes.map((n)=>n.id === conceptId ? {
                                ...n,
                                confidence: data.confidence
                            } : n);
                        const updatedNode = nodes.find((n)=>n.id === conceptId) || null;
                        return {
                            graphData: {
                                ...state.graphData,
                                nodes
                            },
                            selectedNode: state.selectedNode?.id === conceptId ? updatedNode : state.selectedNode
                        };
                    });
                }
            } catch  {
            // silent fail for MVP
            }
        },
        updateMasteryDelta: async (conceptId, delta)=>{
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/mastery/${conceptId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        delta
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    set((state)=>{
                        if (!state.graphData) return {};
                        const nodes = state.graphData.nodes.map((n)=>n.id === conceptId ? {
                                ...n,
                                confidence: data.confidence
                            } : n);
                        const updatedNode = nodes.find((n)=>n.id === conceptId) || null;
                        return {
                            graphData: {
                                ...state.graphData,
                                nodes
                            },
                            selectedNode: state.selectedNode?.id === conceptId ? updatedNode : state.selectedNode
                        };
                    });
                }
            } catch  {
            // silent fail for MVP
            }
        },
        setPollModalOpen: (open)=>set({
                pollModalOpen: open
            }),
        setGraphData: (data)=>set({
                graphData: data
            })
    }));
}),
"[project]/src/lib/colors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COLOR_HEX",
    ()=>COLOR_HEX,
    "confidenceToColor",
    ()=>confidenceToColor,
    "confidenceToFill",
    ()=>confidenceToFill,
    "confidenceToNodeBorder",
    ()=>confidenceToNodeBorder,
    "confidenceToNodeFill",
    ()=>confidenceToNodeFill,
    "confidenceToNodeFillDark",
    ()=>confidenceToNodeFillDark
]);
const COLOR_HEX = {
    gray: "#94a3b8",
    red: "#fb923c",
    yellow: "#eab308",
    green: "#22c55e",
    active: "#3b82f6"
};
function confidenceToColor(confidence) {
    if (confidence === 0) return "gray";
    if (confidence < 0.4) return "red";
    if (confidence < 0.7) return "yellow";
    return "green";
}
function confidenceToFill(confidence) {
    if (confidence === 0) return "#e2e8f0"; // slate-200 (unvisited)
    if (confidence < 0.2) return "#fecaca"; // red-200
    if (confidence < 0.4) return "#fed7aa"; // orange-200
    if (confidence < 0.55) return "#fef08a"; // yellow-200
    if (confidence < 0.7) return "#d9f99d"; // lime-200
    if (confidence < 0.85) return "#bbf7d0"; // green-200
    return "#86efac"; // green-300
}
function confidenceToNodeFill(confidence) {
    if (confidence === 0) return "#e2e8f0"; // slate-200 (not started)
    if (confidence < 0.4) return "#fed7aa"; // orange-200 (struggling)
    if (confidence < 0.55) return "#fef08a"; // yellow-200 (partial)
    if (confidence < 0.7) return "#d9f99d"; // lime-200 (good)
    return "#bbf7d0"; // green-200 (mastered)
}
function confidenceToNodeBorder(confidence) {
    if (confidence === 0) return "#94a3b8"; // gray
    if (confidence < 0.4) return "#fb923c"; // orange-400 (struggling)
    if (confidence < 0.55) return "#facc15"; // yellow-400 (partial)
    if (confidence < 0.7) return "#a3e635"; // lime-400 (good)
    return "#4ade80"; // green-400 (mastered)
}
function confidenceToNodeFillDark(confidence) {
    if (confidence === 0) return "rgba(148,163,184,0.12)";
    if (confidence < 0.4) return "rgba(251,146,60,0.18)";
    if (confidence < 0.55) return "rgba(250,204,21,0.18)";
    if (confidence < 0.7) return "rgba(163,230,53,0.18)";
    return "rgba(74,222,128,0.2)";
}
}),
"[project]/src/lib/graph.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatTimestamp",
    ()=>formatTimestamp,
    "getAncestors",
    ()=>getAncestors
]);
function getAncestors(nodeId, edges) {
    const ancestors = new Set();
    const queue = [
        nodeId
    ];
    while(queue.length > 0){
        const current = queue.shift();
        for (const edge of edges){
            const source = typeof edge.source === "object" ? edge.source.id : edge.source;
            const target = typeof edge.target === "object" ? edge.target.id : edge.target;
            if (target === current && !ancestors.has(source)) {
                ancestors.add(source);
                queue.push(source);
            }
        }
    }
    return ancestors;
}
function formatTimestamp(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
}),
"[project]/src/components/graph/KnowledgeGraph.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KnowledgeGraph
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$simulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceSimulation$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/simulation.js [app-ssr] (ecmascript) <export default as forceSimulation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceLink$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/link.js [app-ssr] (ecmascript) <export default as forceLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$manyBody$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceManyBody$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/manyBody.js [app-ssr] (ecmascript) <export default as forceManyBody>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$collide$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceCollide$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/collide.js [app-ssr] (ecmascript) <export default as forceCollide>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceX$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/x.js [app-ssr] (ecmascript) <export default as forceX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$y$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceY$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-force/src/y.js [app-ssr] (ecmascript) <export default as forceY>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$use$2d$measure$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-use-measure/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-ssr] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-ssr] (ecmascript) <export default as ZoomOut>");
"use client";
;
;
;
;
;
;
;
const NODE_BASE_RADIUS = 36;
const NODE_FONT_SIZE = 10;
const CHAR_WIDTH_RATIO = 0.68;
const NODE_PADDING = 14;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const REVEAL_DURATION_MS = 2000;
const REVEAL_INITIAL_DELAY = 300;
const REVEAL_FPS = 30;
const DRAG_THRESHOLD = 8;
const ACTIVE_GLOW = "#C5AE79";
function getNodeRadius(label, relevance) {
    const charWidth = NODE_FONT_SIZE * CHAR_WIDTH_RATIO;
    const longestWord = label.split(/[\s/\-]+/).reduce((a, b)=>a.length > b.length ? a : b, "");
    const wordWidth = longestWord.length * charWidth;
    const minRadiusForWord = (wordWidth + NODE_PADDING) / 2;
    const baseRadius = relevance * 20 + NODE_BASE_RADIUS;
    return Math.max(baseRadius, minRadiusForWord);
}
function KnowledgeGraph({ nodes, edges, activeConceptId, highlightedNodeIds, onNodeClick }) {
    const [containerRef, bounds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$use$2d$measure$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const [simNodes, setSimNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [simLinks, setSimLinks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const positionCacheRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const originalPositionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const [zoom, setZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.75);
    const [pan, setPan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const isPanning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const panStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const panOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const [revealProgress, setRevealProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const onNodeClickRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onNodeClick);
    onNodeClickRef.current = onNodeClick;
    const draggingNodeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dragStartPointer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const dragStartNodePos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const hasDraggedPastThreshold = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const simNodesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(simNodes);
    simNodesRef.current = simNodes;
    const zoomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(zoom);
    zoomRef.current = zoom;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (nodes.length === 0) return;
        const nodesCopy = nodes.map((n)=>{
            const cached = positionCacheRef.current.get(n.id);
            return {
                ...n,
                relevance: (n.difficulty ?? 3) / 5,
                ...cached ? {
                    x: cached.x,
                    y: cached.y
                } : {}
            };
        });
        const nodeIds = new Set(nodesCopy.map((n)=>n.id));
        const linksCopy = edges.filter((e)=>nodeIds.has(e.source) && nodeIds.has(e.target)).map((e)=>({
                source: e.source,
                target: e.target
            }));
        const levels = {};
        nodesCopy.forEach((n)=>{
            levels[n.id] = 0;
        });
        for(let i = 0; i < nodesCopy.length; i++){
            linksCopy.forEach((l)=>{
                const s = typeof l.source === "object" ? l.source.id : l.source;
                const t = typeof l.target === "object" ? l.target.id : l.target;
                if (levels[s] !== undefined && levels[t] !== undefined) {
                    if (levels[t] < levels[s] + 1) {
                        levels[t] = levels[s] + 1;
                    }
                }
            });
        }
        nodesCopy.forEach((n)=>{
            n.level = levels[n.id];
        });
        setSimNodes(nodesCopy);
        setSimLinks(linksCopy);
    }, [
        nodes,
        edges
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!ready) return;
        setRevealProgress(0);
        const stepMs = 1000 / REVEAL_FPS;
        const steps = Math.ceil(REVEAL_DURATION_MS / stepMs);
        let frame = 0;
        const cleanupRef = {
            current: ()=>{}
        };
        const delayTimer = setTimeout(()=>{
            const interval = setInterval(()=>{
                frame++;
                const t = Math.min(frame / steps, 1);
                setRevealProgress(t);
                if (t >= 1) clearInterval(interval);
            }, stepMs);
            cleanupRef.current = ()=>clearInterval(interval);
        }, REVEAL_INITIAL_DELAY);
        return ()=>{
            clearTimeout(delayTimer);
            cleanupRef.current();
        };
    }, [
        ready
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!bounds.width || !bounds.height || simNodes.length === 0) return;
        const allCached = simNodes.every((n)=>n.x !== undefined && n.y !== undefined);
        if (allCached && ready) {
            return;
        }
        const paddingX = 100;
        const availableWidth = bounds.width - paddingX * 2;
        const maxLevel = Math.max(...simNodes.map((n)=>n.level ?? 0));
        const getTargetX = (node)=>{
            if (maxLevel === 0) return bounds.width / 2;
            return paddingX + (node.level ?? 0) / maxLevel * availableWidth;
        };
        const simulation = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$simulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceSimulation$3e$__["forceSimulation"](simNodes).force("link", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceLink$3e$__["forceLink"](simLinks).id((d)=>d.id).distance(180)).force("charge", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$manyBody$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceManyBody$3e$__["forceManyBody"]().strength(-500)).force("collide", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$collide$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceCollide$3e$__["forceCollide"]().radius((d)=>getNodeRadius(d.label, d.relevance ?? 0.6) * 2)).force("x", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceX$3e$__["forceX"]().x((d)=>getTargetX(d)).strength(0.8)).force("y", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$force$2f$src$2f$y$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__forceY$3e$__["forceY"](bounds.height / 2).strength(0.1));
        simulation.stop();
        for(let i = 0; i < 300; i++){
            simulation.tick();
        }
        const isFirstLayout = originalPositionsRef.current.size === 0;
        for (const node of simNodes){
            if (node.x !== undefined && node.y !== undefined) {
                positionCacheRef.current.set(node.id, {
                    x: node.x,
                    y: node.y
                });
                if (isFirstLayout) {
                    originalPositionsRef.current.set(node.id, {
                        x: node.x,
                        y: node.y
                    });
                }
            }
        }
        const xs = simNodes.filter((n)=>n.x != null).map((n)=>n.x);
        const ys = simNodes.filter((n)=>n.y != null).map((n)=>n.y);
        if (xs.length > 0 && ys.length > 0) {
            const maxR = Math.max(...simNodes.map((n)=>getNodeRadius(n.label, n.relevance ?? 0.6)));
            const pad = maxR + 20;
            const minX = Math.min(...xs) - pad;
            const maxX = Math.max(...xs) + pad;
            const minY = Math.min(...ys) - pad;
            const maxY = Math.max(...ys) + pad;
            const graphW = maxX - minX;
            const graphH = maxY - minY;
            const scaleX = bounds.width / graphW;
            const scaleY = bounds.height / graphH;
            const fitZoom = Math.min(scaleX, scaleY, 1);
            const graphCenterX = (minX + maxX) / 2;
            const graphCenterY = (minY + maxY) / 2;
            const containerCenterX = bounds.width / 2;
            const containerCenterY = bounds.height / 2;
            setZoom(fitZoom);
            setPan({
                x: containerCenterX - graphCenterX * fitZoom - containerCenterX * (1 - fitZoom),
                y: containerCenterY - graphCenterY * fitZoom - containerCenterY * (1 - fitZoom)
            });
        }
        setSimNodes([
            ...simNodes
        ]);
        setReady(true);
        return ()=>{
            simulation.stop();
        };
    }, [
        bounds.width,
        bounds.height,
        simNodes.length
    ]);
    const revealRank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const positioned = simNodes.filter((n)=>n.x != null);
        if (positioned.length === 0) return new Map();
        const sorted = [
            ...positioned
        ].sort((a, b)=>a.x - b.x);
        const map = new Map();
        sorted.forEach((n, i)=>{
            map.set(n.id, sorted.length > 1 ? i / (sorted.length - 1) : 0);
        });
        return map;
    }, [
        simNodes
    ]);
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        setZoom((prev)=>{
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * delta));
        });
    }, []);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const nodeEl = e.target.closest("[data-graph-node]");
        if (nodeEl) {
            const nodeId = nodeEl.getAttribute("data-node-id");
            if (!nodeId) return;
            const node = simNodesRef.current.find((n)=>n.id === nodeId);
            if (!node || node.x === undefined || node.y === undefined) return;
            draggingNodeId.current = nodeId;
            dragStartPointer.current = {
                x: e.clientX,
                y: e.clientY
            };
            dragStartNodePos.current = {
                x: node.x,
                y: node.y
            };
            hasDraggedPastThreshold.current = false;
            e.currentTarget.setPointerCapture(e.pointerId);
            return;
        }
        isPanning.current = true;
        panStart.current = {
            x: e.clientX,
            y: e.clientY
        };
        panOffset.current = {
            x: pan.x,
            y: pan.y
        };
        e.target.setPointerCapture(e.pointerId);
    }, [
        pan
    ]);
    const handlePointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (draggingNodeId.current) {
            const dx = e.clientX - dragStartPointer.current.x;
            const dy = e.clientY - dragStartPointer.current.y;
            if (!hasDraggedPastThreshold.current) {
                if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
                hasDraggedPastThreshold.current = true;
            }
            const z = zoomRef.current;
            const newX = dragStartNodePos.current.x + dx / z;
            const newY = dragStartNodePos.current.y + dy / z;
            const id = draggingNodeId.current;
            positionCacheRef.current.set(id, {
                x: newX,
                y: newY
            });
            setSimNodes((prev)=>prev.map((n)=>n.id === id ? {
                        ...n,
                        x: newX,
                        y: newY
                    } : n));
            return;
        }
        if (!isPanning.current) return;
        setPan({
            x: panOffset.current.x + (e.clientX - panStart.current.x),
            y: panOffset.current.y + (e.clientY - panStart.current.y)
        });
    }, []);
    const handlePointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (draggingNodeId.current) {
            if (!hasDraggedPastThreshold.current) {
                const node = simNodesRef.current.find((n)=>n.id === draggingNodeId.current);
                if (node) onNodeClickRef.current?.(node);
            }
            draggingNodeId.current = null;
            hasDraggedPastThreshold.current = false;
            return;
        }
        isPanning.current = false;
    }, []);
    const handleReset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setZoom(0.75);
        setPan({
            x: 0,
            y: 0
        });
        if (originalPositionsRef.current.size > 0) {
            const originals = originalPositionsRef.current;
            positionCacheRef.current = new Map(originals);
            setSimNodes((prev)=>prev.map((n)=>{
                    const pos = originals.get(n.id);
                    return pos ? {
                        ...n,
                        x: pos.x,
                        y: pos.y
                    } : n;
                }));
        }
    }, []);
    const nodeMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        simNodes.forEach((n)=>map.set(n.id, n));
        return map;
    }, [
        simNodes
    ]);
    const activeSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const set = new Set();
        if (highlightedNodeIds) {
            highlightedNodeIds.forEach((id)=>set.add(id));
        }
        return set;
    }, [
        highlightedNodeIds
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-full overflow-hidden bg-[#0a0a0a] rounded-xl border border-[#1e1e24] font-sans",
        onWheel: handleWheel,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        style: {
            touchAction: "none"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-40 pointer-events-none",
                style: {
                    backgroundImage: "radial-gradient(circle, rgba(197,174,121,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                lineNumber: 353,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "w-full h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 origin-center",
                    style: {
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "absolute inset-0 pointer-events-none",
                            width: bounds.width || "100%",
                            height: bounds.height || "100%",
                            style: {
                                overflow: "visible"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                                            id: "arrowhead",
                                            markerWidth: "12",
                                            markerHeight: "10",
                                            refX: "10",
                                            refY: "5",
                                            orient: "auto",
                                            markerUnits: "userSpaceOnUse",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                points: "0 0, 12 5, 0 10",
                                                fill: "#64748b"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                                lineNumber: 381,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 372,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                                            id: "arrowhead-active",
                                            markerWidth: "14",
                                            markerHeight: "10",
                                            refX: "12",
                                            refY: "5",
                                            orient: "auto",
                                            markerUnits: "userSpaceOnUse",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                points: "0 0, 14 5, 0 10",
                                                fill: "#C5AE79"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                                lineNumber: 392,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 383,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 371,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                    children: simLinks.map((link, i)=>{
                                        const srcId = typeof link.source === "object" ? link.source.id : link.source;
                                        const tgtId = typeof link.target === "object" ? link.target.id : link.target;
                                        const source = nodeMap.get(srcId);
                                        const target = nodeMap.get(tgtId);
                                        if (!source || !target || source.x == null || target.x == null || source.y == null || target.y == null) return null;
                                        const isSourceRel = activeSet.has(source.id);
                                        const isTargetRel = activeSet.has(target.id);
                                        const isPath = isSourceRel && isTargetRel;
                                        const targetSize = getNodeRadius(target.label, target.relevance ?? 0.6);
                                        const sourceSize = getNodeRadius(source.label, source.relevance ?? 0.6);
                                        const totalDx = target.x - source.x;
                                        const totalDy = target.y - source.y;
                                        const dist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
                                        if (dist === 0) return null;
                                        const ux = totalDx / dist;
                                        const uy = totalDy / dist;
                                        const margin = 6;
                                        const totalInset = sourceSize + targetSize + margin;
                                        let sx, sy, tx, ty;
                                        if (dist > totalInset) {
                                            sx = source.x + ux * sourceSize;
                                            sy = source.y + uy * sourceSize;
                                            tx = target.x - ux * (targetSize + margin);
                                            ty = target.y - uy * (targetSize + margin);
                                        } else {
                                            sx = source.x;
                                            sy = source.y;
                                            tx = target.x;
                                            ty = target.y;
                                        }
                                        const cdx = tx - sx;
                                        const d = `M${sx},${sy} C${sx + cdx / 2},${sy} ${tx - cdx / 2},${ty} ${tx},${ty}`;
                                        const sourceRank = revealRank.get(source.id) ?? 0;
                                        const targetRank = revealRank.get(target.id) ?? 0;
                                        const edgeRevealed = revealProgress > Math.max(sourceRank, targetRank);
                                        const particleColor = isPath ? "#C5AE79" : "#64748b";
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: d,
                                                    stroke: isPath ? "#C5AE79" : "#64748b",
                                                    strokeWidth: isPath ? 2.5 : 1.5,
                                                    opacity: edgeRevealed ? isPath ? 1 : activeSet.size > 0 ? 0.15 : 0.8 : 0,
                                                    fill: "none",
                                                    markerEnd: isPath ? "url(#arrowhead-active)" : "url(#arrowhead)",
                                                    style: {
                                                        transition: "opacity 0.4s ease-out"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                                    lineNumber: 443,
                                                    columnNumber: 41
                                                }, this),
                                                edgeRevealed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                                    r: "2.5",
                                                    fill: particleColor,
                                                    initial: {
                                                        offsetDistance: "0%",
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        offsetDistance: [
                                                            "0%",
                                                            "100%"
                                                        ],
                                                        opacity: [
                                                            0,
                                                            0.5,
                                                            0.5,
                                                            0
                                                        ]
                                                    },
                                                    transition: {
                                                        duration: 3 + i % 5 * 0.4,
                                                        delay: i * 0.2,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    },
                                                    style: {
                                                        offsetPath: `path("${d}")`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                                    lineNumber: 461,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, `link-${i}`, true, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 442,
                                            columnNumber: 37
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 395,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 365,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 pointer-events-none",
                            "data-graph-nodes": true,
                            children: simNodes.map((node)=>{
                                if (node.x === undefined || node.y === undefined) return null;
                                const size = getNodeRadius(node.label, node.relevance ?? 0.6);
                                const borderColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["confidenceToNodeBorder"])(node.confidence ?? 0);
                                const isInSet = activeSet.has(node.id);
                                const hasSelection = activeSet.size > 0;
                                const isDimmed = hasSelection && !isInSet;
                                const isActive = node.id === activeConceptId;
                                const glowColor = isActive ? ACTIVE_GLOW : borderColor;
                                const baseFill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["confidenceToNodeFillDark"])(node.confidence ?? 0);
                                const nodeRank = revealRank.get(node.id) ?? 0;
                                const nodeRevealed = revealProgress > nodeRank;
                                const targetOpacity = nodeRevealed ? isDimmed ? 0.2 : 1 : 0;
                                const targetScale = nodeRevealed ? isActive ? 1.25 : isInSet && !isDimmed ? 1.08 : 1 : 0;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: false,
                                    animate: {
                                        opacity: targetOpacity,
                                        scale: targetScale,
                                        x: node.x - size,
                                        y: node.y - size
                                    },
                                    transition: {
                                        opacity: {
                                            duration: 0.4
                                        },
                                        scale: {
                                            duration: 0.3
                                        },
                                        x: {
                                            duration: draggingNodeId.current === node.id ? 0.06 : 0.4
                                        },
                                        y: {
                                            duration: draggingNodeId.current === node.id ? 0.06 : 0.4
                                        }
                                    },
                                    "data-graph-node": true,
                                    "data-node-id": node.id,
                                    className: "absolute rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transition-all duration-500 ease-out",
                                    style: {
                                        width: size * 2,
                                        height: size * 2,
                                        background: isInSet || isActive ? `linear-gradient(135deg, ${glowColor}20, ${glowColor}10)` : baseFill,
                                        border: isInSet ? `2.5px solid ${glowColor}` : isActive ? `2.5px solid ${ACTIVE_GLOW}` : `2px solid ${borderColor}`,
                                        boxShadow: isInSet ? `0 0 24px ${glowColor}40, 0 4px 12px ${glowColor}20` : isActive ? `0 0 20px ${ACTIVE_GLOW}35, 0 4px 12px ${ACTIVE_GLOW}15` : "0 0 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute rounded-full pointer-events-none",
                                            style: {
                                                top: "8%",
                                                left: "15%",
                                                width: "55%",
                                                height: "35%",
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)",
                                                borderRadius: "50%"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 542,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center p-1.5 text-center pointer-events-none overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `font-[family-name:var(--font-comfortaa)] font-semibold leading-[1.15] transition-colors ${isInSet || isActive ? "text-[#C5AE79]" : "text-slate-200"}`,
                                                style: {
                                                    fontSize: `${NODE_FONT_SIZE}px`,
                                                    wordBreak: "keep-all",
                                                    overflowWrap: "normal"
                                                },
                                                children: node.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                                lineNumber: 555,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 554,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, node.id, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 505,
                                    columnNumber: 33
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 483,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                    lineNumber: 361,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                lineNumber: 360,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 right-4 flex flex-col gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setZoom((z)=>Math.min(MAX_ZOOM, z * 1.25)),
                        className: "p-2 rounded-lg bg-[#111] hover:bg-[#1e1e24] text-[#C5AE79]/60 hover:text-[#C5AE79] border border-[#1e1e24] backdrop-blur-md transition-colors",
                        title: "Zoom In",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 580,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                        lineNumber: 575,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setZoom((z)=>Math.max(MIN_ZOOM, z * 0.8)),
                        className: "p-2 rounded-lg bg-[#111] hover:bg-[#1e1e24] text-[#C5AE79]/60 hover:text-[#C5AE79] border border-[#1e1e24] backdrop-blur-md transition-colors",
                        title: "Zoom Out",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 587,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                        lineNumber: 582,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleReset,
                        className: "p-2 rounded-lg bg-[#111] hover:bg-[#1e1e24] text-[#C5AE79]/60 hover:text-[#C5AE79] border border-[#1e1e24] backdrop-blur-md transition-colors",
                        title: "Reset View",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 594,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                        lineNumber: 589,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                lineNumber: 574,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 p-4 rounded-xl bg-[#0f0f12]/90 border border-[#1e1e24] backdrop-blur-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3 text-xs text-gray-400 font-medium",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "32",
                                    height: "6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "0",
                                            y1: "3",
                                            x2: "26",
                                            y2: "3",
                                            stroke: "#64748b",
                                            strokeWidth: "1.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 601,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                            points: "26,0 32,3 26,6",
                                            fill: "#64748b"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 602,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 600,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Prerequisite"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 604,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 599,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-px bg-gray-800 my-1"
                        }, void 0, false, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 606,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-x-4 gap-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2.5 h-2.5 rounded-full",
                                            style: {
                                                background: "#4ade80"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 609,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-300",
                                            children: "Mastered"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 610,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 608,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2.5 h-2.5 rounded-full",
                                            style: {
                                                background: "#a3e635"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 613,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-300",
                                            children: "On Track"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 614,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 612,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2.5 h-2.5 rounded-full",
                                            style: {
                                                background: "#facc15"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 617,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-300",
                                            children: "Building"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 618,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 616,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2.5 h-2.5 rounded-full",
                                            style: {
                                                background: "#fb923c"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 621,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-300",
                                            children: "Developing"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 622,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 620,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2.5 h-2.5 rounded-full border border-gray-500 bg-gray-500/20"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 625,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400",
                                            children: "Not Started"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                            lineNumber: 626,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                                    lineNumber: 624,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                            lineNumber: 607,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                    lineNumber: 598,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
                lineNumber: 597,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/graph/KnowledgeGraph.tsx",
        lineNumber: 344,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/app/courses/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseGraphPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$nebulaStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/nebulaStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graph$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/graph.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$KnowledgeGraph$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/graph/KnowledgeGraph.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/video.js [app-ssr] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-up.js [app-ssr] (ecmascript) <export default as ThumbsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-down.js [app-ssr] (ecmascript) <export default as ThumbsDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
"use client";
;
;
;
;
;
;
;
;
;
const COLOR_HEX = {
    gray: "#94a3b8",
    red: "#fb923c",
    yellow: "#facc15",
    green: "#4ade80"
};
function getNodeColor(confidence) {
    if (confidence === 0) return COLOR_HEX.gray;
    if (confidence < 0.4) return COLOR_HEX.red;
    if (confidence < 0.7) return COLOR_HEX.yellow;
    return COLOR_HEX.green;
}
function CourseGraphPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const courseId = params.id;
    const isDev = searchParams.get("dev") === "true";
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { graphData, loading, selectedNode, drawerOpen, resources, resourcesLoading, poll, pollLoading, pollModalOpen, fetchGraph, selectNode, closeDrawer, generatePoll, updateMastery, updateMasteryDelta, setPollModalOpen, setGraphData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$nebulaStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNebulaStore"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthToken"])()) {
            router.replace("/login");
            return;
        }
        fetchGraph(courseId);
    }, [
        courseId,
        router,
        fetchGraph
    ]);
    const handleUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/courses/${courseId}/upload`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                setGraphData(data);
            } else {
                const err = await res.json().catch(()=>({
                        detail: "Upload failed"
                    }));
                alert(err.detail || "Upload failed");
            }
        } catch  {
            alert("Upload failed");
        } finally{
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    const handleNodeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((node)=>{
        const full = graphData?.nodes.find((n)=>n.id === node.id);
        if (full) selectNode(full);
    }, [
        selectNode,
        graphData?.nodes
    ]);
    const MAX_DISPLAY_NODES = 10;
    const displayGraph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!graphData || graphData.nodes.length === 0) return null;
        if (graphData.nodes.length <= MAX_DISPLAY_NODES) return graphData;
        const linkCount = new Map();
        graphData.nodes.forEach((n)=>linkCount.set(n.id, 0));
        graphData.links.forEach((link)=>{
            const s = typeof link.source === "string" ? link.source : link.source.id;
            const t = typeof link.target === "string" ? link.target : link.target.id;
            linkCount.set(s, (linkCount.get(s) ?? 0) + 1);
            linkCount.set(t, (linkCount.get(t) ?? 0) + 1);
        });
        const sorted = [
            ...graphData.nodes
        ].sort((a, b)=>(linkCount.get(b.id) ?? 0) - (linkCount.get(a.id) ?? 0));
        const kept = new Set(sorted.slice(0, MAX_DISPLAY_NODES).map((n)=>n.id));
        const nodes = graphData.nodes.filter((n)=>kept.has(n.id));
        const links = graphData.links.filter((link)=>{
            const s = typeof link.source === "string" ? link.source : link.source.id;
            const t = typeof link.target === "string" ? link.target : link.target.id;
            return kept.has(s) && kept.has(t);
        });
        return {
            ...graphData,
            nodes,
            links
        };
    }, [
        graphData
    ]);
    const kgNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!displayGraph) return [];
        return displayGraph.nodes.map((n)=>({
                id: n.id,
                label: n.label,
                color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["confidenceToColor"])(n.confidence),
                confidence: n.confidence,
                description: n.description,
                category: n.concept_type
            }));
    }, [
        displayGraph
    ]);
    const kgEdges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!displayGraph) return [];
        return displayGraph.links.map((link)=>({
                source: typeof link.source === "string" ? link.source : link.source.id,
                target: typeof link.target === "string" ? link.target : link.target.id
            }));
    }, [
        displayGraph
    ]);
    const highlightedNodeIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!selectedNode) return undefined;
        const set = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graph$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAncestors"])(selectedNode.id, kgEdges));
        set.add(selectedNode.id);
        return set;
    }, [
        selectedNode?.id,
        kgEdges
    ]);
    const status = selectedNode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStatusFromConfidence"])(selectedNode.confidence) : null;
    const hasGraph = displayGraph && displayGraph.nodes.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center gap-4 px-4 py-2.5 border-b border-[#C5AE79]/15 bg-[#0a0a0a]/90 backdrop-blur-md z-50 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/courses"),
                        className: "text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                            lineNumber: 173,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 169,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold tracking-wider text-[#C5AE79]/80",
                                children: "NEBULA"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 176,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[#C5AE79]/20",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 177,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-[#C5AE79] truncate max-w-[300px]",
                                children: graphData?.course?.name || "Loading..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 178,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 175,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ml-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: "application/pdf",
                                className: "hidden",
                                ref: fileInputRef,
                                onChange: handleUpload
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 183,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-[#C5AE79]/10 border border-[#C5AE79]/30 text-[#C5AE79] rounded-lg hover:bg-[#C5AE79]/20 transition-all disabled:opacity-50",
                                children: [
                                    uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-3.5 h-3.5 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 196,
                                        columnNumber: 29
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 29
                                    }, this),
                                    uploading ? "Analyzing..." : "Upload PDF"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 190,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 182,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 168,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative min-h-0",
                children: [
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex items-center justify-center bg-[#0a0a0a]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-6 h-6 animate-spin text-[#C5AE79]"
                        }, void 0, false, {
                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                            lineNumber: 208,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 207,
                        columnNumber: 21
                    }, this) : !hasGraph ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-2xl bg-[#C5AE79]/10 flex items-center justify-center mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    className: "w-8 h-8 text-[#C5AE79]/50"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 213,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 212,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-[#C5AE79] mb-1",
                                children: "Upload Course Material"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 215,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-[#C5AE79]/50 max-w-sm mb-4",
                                children: "Upload a PDF (syllabus, slides, or textbook) to generate your knowledge graph."
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 218,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "h-10 px-5 bg-[#C5AE79] text-[#0a0a0a] font-semibold text-sm rounded-lg shadow-[0_0_20px_rgba(197,174,121,0.3)] disabled:opacity-50",
                                children: uploading ? "Analyzing..." : "Select PDF"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 222,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 211,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$KnowledgeGraph$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        nodes: kgNodes,
                        edges: kgEdges,
                        activeConceptId: selectedNode?.id ?? null,
                        highlightedNodeIds: highlightedNodeIds,
                        onNodeClick: handleNodeClick
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 231,
                        columnNumber: 21
                    }, this),
                    drawerOpen && selectedNode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 h-full w-80 bg-[#111]/95 border-l border-[#C5AE79]/15 backdrop-blur-xl z-40 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between p-4 border-b border-[#C5AE79]/15",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-base",
                                                        children: status?.emoji
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-semibold uppercase tracking-wider",
                                                        style: {
                                                            color: getNodeColor(selectedNode.confidence)
                                                        },
                                                        children: status?.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 246,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 244,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-bold text-[#C5AE79] truncate",
                                                children: selectedNode.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 253,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-[#C5AE79]/40 capitalize",
                                                children: selectedNode.concept_type
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 256,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: closeDrawer,
                                        className: "p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 264,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 242,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-4 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#C5AE79]/70 leading-relaxed",
                                        children: selectedNode.description
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-[10px] mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#C5AE79]/50 font-medium",
                                                        children: "Confidence"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-[#C5AE79]",
                                                        children: [
                                                            Math.round(selectedNode.confidence * 100),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 274,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 272,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1.5 bg-[#0a0a0a] rounded-full border border-[#C5AE79]/10 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full rounded-full transition-all duration-500",
                                                    style: {
                                                        width: `${selectedNode.confidence * 100}%`,
                                                        backgroundColor: getNodeColor(selectedNode.confidence),
                                                        boxShadow: `0 0 8px ${getNodeColor(selectedNode.confidence)}`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                    lineNumber: 279,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 278,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-[10px] font-semibold text-[#C5AE79] uppercase tracking-wider mb-2",
                                                children: "Recommended Resources"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 290,
                                                columnNumber: 33
                                            }, this),
                                            resourcesLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-[#C5AE79]/40 text-xs py-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-3 h-3 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 295,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Loading resources..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 294,
                                                columnNumber: 37
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: resources.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: r.url,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "flex items-start gap-2 p-2.5 rounded-lg bg-[#0a0a0a] border border-[#C5AE79]/10 hover:border-[#00ffff]/30 hover:bg-[#00ffff]/5 transition-all group",
                                                        children: [
                                                            r.type === "video" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                                className: "w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 309,
                                                                columnNumber: 53
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                className: "w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 311,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-medium text-[#C5AE79]/80 group-hover:text-[#C5AE79] truncate",
                                                                        children: r.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                        lineNumber: 314,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-[#C5AE79]/40 mt-0.5 line-clamp-2",
                                                                        children: r.why
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                        lineNumber: 317,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 313,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                className: "w-3 h-3 text-[#C5AE79]/20 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 321,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 299,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 289,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>generatePoll(selectedNode.id),
                                        disabled: pollLoading,
                                        className: "w-full h-9 bg-[#C5AE79]/15 border border-[#C5AE79]/30 text-[#C5AE79] text-xs font-semibold rounded-lg hover:bg-[#C5AE79]/25 transition-all disabled:opacity-50",
                                        children: pollLoading ? "Generating..." : "🎯 Take Quick Poll"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 327,
                                        columnNumber: 29
                                    }, this),
                                    isDev && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-3 border-t border-[#C5AE79]/10 space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-[#C5AE79]/30 uppercase tracking-widest font-mono mb-2",
                                                children: "Dev Controls"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 336,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMastery(selectedNode.id, "correct"),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#00ffff]/30 text-[#00ffff] rounded-md hover:bg-[#00ffff]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Correct"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 339,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMastery(selectedNode.id, "wrong"),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#ff0055]/30 text-[#ff0055] rounded-md hover:bg-[#ff0055]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsDown$3e$__["ThumbsDown"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Wrong"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 345,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMasteryDelta(selectedNode.id, 0.3),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#C5AE79]/30 text-[#C5AE79] rounded-md hover:bg-[#C5AE79]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 355,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Exposure (+30%)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 351,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 335,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 267,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 241,
                        columnNumber: 21
                    }, this),
                    pollModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PollModal, {
                        poll: poll,
                        loading: pollLoading,
                        nodeId: selectedNode?.id || "",
                        onClose: ()=>setPollModalOpen(false),
                        onResult: (evalResult)=>{
                            if (selectedNode) updateMastery(selectedNode.id, evalResult);
                            setPollModalOpen(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 364,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 205,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/courses/[id]/page.tsx",
        lineNumber: 167,
        columnNumber: 9
    }, this);
}
function PollModal({ poll, loading, onClose, onResult }) {
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showResult, setShowResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = ()=>{
        if (!selected || !poll) return;
        const isCorrect = selected === poll.correct_answer;
        setShowResult(true);
        setTimeout(()=>onResult(isCorrect ? "correct" : "wrong"), 1500);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#111] border border-[#C5AE79]/20 rounded-2xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]",
            children: loading || !poll ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-6 h-6 animate-spin text-[#C5AE79]"
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 407,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-3 text-sm text-[#C5AE79]/60",
                        children: "Generating question..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 408,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 406,
                columnNumber: 21
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-[#C5AE79] leading-snug pr-4",
                                children: poll.question
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 413,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 420,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 416,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 412,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 mb-5",
                        children: poll.options?.map((opt, i)=>{
                            const letter = opt[0];
                            const isThis = selected === letter;
                            const isCorrectAnswer = showResult && letter === poll.correct_answer;
                            const isWrongSelected = showResult && isThis && letter !== poll.correct_answer;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>!showResult && setSelected(letter),
                                disabled: showResult,
                                className: `w-full text-left p-3 rounded-lg text-xs border transition-all ${isCorrectAnswer ? "border-[#00ffff]/50 bg-[#00ffff]/10 text-[#00ffff]" : isWrongSelected ? "border-[#ff0055]/50 bg-[#ff0055]/10 text-[#ff0055]" : isThis ? "border-[#C5AE79]/50 bg-[#C5AE79]/10 text-[#C5AE79]" : "border-[#C5AE79]/15 text-[#C5AE79]/70 hover:border-[#C5AE79]/30"}`,
                                children: opt
                            }, i, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 431,
                                columnNumber: 37
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 423,
                        columnNumber: 25
                    }, this),
                    !showResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSubmit,
                        disabled: !selected,
                        className: "w-full h-9 bg-[#C5AE79] text-[#0a0a0a] text-xs font-bold rounded-lg disabled:opacity-30 transition-all",
                        children: "Submit Answer"
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 451,
                        columnNumber: 29
                    }, this),
                    showResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-center text-sm font-semibold py-2 ${selected === poll.correct_answer ? "text-[#00ffff]" : "text-[#ff0055]"}`,
                        children: selected === poll.correct_answer ? "✅ Correct! Mastery updated." : `❌ Wrong. Correct answer: ${poll.correct_answer}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 460,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/src/app/courses/[id]/page.tsx",
            lineNumber: 404,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/courses/[id]/page.tsx",
        lineNumber: 403,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6ac5478._.js.map