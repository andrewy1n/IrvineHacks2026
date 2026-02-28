(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
const API_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem("nebula_token");
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/nebulaStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNebulaStore",
    ()=>useNebulaStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
const useNebulaStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/courses/${courseId}/graph`);
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
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/concepts/${conceptId}/resources`);
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
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/concepts/${conceptId}/poll`, {
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
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/mastery/${conceptId}`, {
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
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/mastery/${conceptId}`, {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/courses/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseGraphPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$nebulaStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/nebulaStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/video.js [app-client] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-up.js [app-client] (ecmascript) <export default as ThumbsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-down.js [app-client] (ecmascript) <export default as ThumbsDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
;
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// Dynamic import for react-force-graph-2d (requires window)
const ForceGraph2D = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/react-force-graph-2d/dist/react-force-graph-2d.mjs [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-force-graph-2d/dist/react-force-graph-2d.mjs [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ForceGraph2D;
// Canvas drawing helpers
const GOLD = "#C5AE79";
const CYAN = "#00ffff";
const RED = "#ff0055";
const GREY = "rgba(255,255,255,0.25)";
function getNodeColor(confidence) {
    if (confidence === 0) return GREY;
    if (confidence < 0.4) return RED;
    if (confidence < 0.7) return GOLD;
    return CYAN;
}
function getNodeGlowRadius(confidence) {
    if (confidence === 0) return 0;
    if (confidence < 0.4) return 20;
    if (confidence < 0.7) return 14;
    return 25;
}
// Dynamic node radius: ensures the circle is at least large enough to fit the longest word
const FONT_WIDTH_ESTIMATE = 6.5; // approx px per char at ~11px bold font
const NODE_PADDING = 14; // px padding inside circle
const BASE_RADIUS = 28; // minimum radius
function getNodeRadius(label, confidence) {
    // Find the longest word in the label
    const longestWord = label.split(/[\s\-\/]+/).reduce((a, b)=>a.length > b.length ? a : b, "");
    const minRadiusForWord = (longestWord.length * FONT_WIDTH_ESTIMATE + NODE_PADDING) / 2;
    const baseForState = confidence === 0 ? BASE_RADIUS * 0.75 : BASE_RADIUS;
    return Math.max(baseForState, minRadiusForWord);
}
function CourseGraphPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const courseId = params.id;
    const isDev = searchParams.get("dev") === "true";
    const graphRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pulsePhase, setPulsePhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const { graphData, loading, selectedNode, drawerOpen, resources, resourcesLoading, poll, pollLoading, pollModalOpen, fetchGraph, selectNode, closeDrawer, generatePoll, updateMastery, updateMasteryDelta, setPollModalOpen, setGraphData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$nebulaStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNebulaStore"])();
    // Auth guard
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourseGraphPage.useEffect": ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthToken"])()) {
                router.replace("/login");
                return;
            }
            fetchGraph(courseId);
        }
    }["CourseGraphPage.useEffect"], [
        courseId,
        router,
        fetchGraph
    ]);
    // Pulse animation for Exposed (gold) nodes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourseGraphPage.useEffect": ()=>{
            const interval = setInterval({
                "CourseGraphPage.useEffect.interval": ()=>{
                    setPulsePhase({
                        "CourseGraphPage.useEffect.interval": (p)=>(p + 0.05) % (Math.PI * 2)
                    }["CourseGraphPage.useEffect.interval"]);
                }
            }["CourseGraphPage.useEffect.interval"], 50);
            return ({
                "CourseGraphPage.useEffect": ()=>clearInterval(interval)
            })["CourseGraphPage.useEffect"];
        }
    }["CourseGraphPage.useEffect"], []);
    // PDF Upload
    const handleUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/courses/${courseId}/upload`, {
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
    // Node click handler
    const handleNodeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CourseGraphPage.useCallback[handleNodeClick]": (node)=>{
            selectNode(node);
        }
    }["CourseGraphPage.useCallback[handleNodeClick]"], [
        selectNode
    ]);
    // Canvas node rendering
    const nodeCanvasObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CourseGraphPage.useCallback[nodeCanvasObject]": (node, ctx, globalScale)=>{
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
            ctx.fillStyle = confidence === 0 ? "rgba(255,255,255,0.5)" : isSelected ? "#ffffff" : color;
            // Simple word wrap for labels that are wider than the circle
            const maxWidth = radius * 1.7;
            const words = label.split(/\s+/);
            const lines = [];
            let currentLine = words[0] || "";
            for(let i = 1; i < words.length; i++){
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
            const startY = node.y - (lines.length - 1) * lineHeight / 2;
            for(let i = 0; i < lines.length; i++){
                ctx.fillText(lines[i], node.x, startY + i * lineHeight);
            }
        }
    }["CourseGraphPage.useCallback[nodeCanvasObject]"], [
        selectedNode,
        pulsePhase
    ]);
    // Pointer area for click detection (matches visual size)
    const nodePointerAreaPaint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CourseGraphPage.useCallback[nodePointerAreaPaint]": (node, color, ctx)=>{
            const label = node.label || "";
            const confidence = node.confidence ?? 0;
            const radius = getNodeRadius(label, confidence);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }["CourseGraphPage.useCallback[nodePointerAreaPaint]"], []);
    // Custom link rendering
    const linkCanvasObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CourseGraphPage.useCallback[linkCanvasObject]": (link, ctx)=>{
            const source = link.source;
            const target = link.target;
            if (!source || !target || typeof source === "string" || typeof target === "string") return;
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(197, 174, 121, 0.15)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }["CourseGraphPage.useCallback[linkCanvasObject]"], []);
    const status = selectedNode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStatusFromConfidence"])(selectedNode.confidence) : null;
    const hasGraph = graphData && graphData.nodes.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center gap-4 px-4 py-2.5 border-b border-[#C5AE79]/15 bg-[#0a0a0a]/90 backdrop-blur-md z-50 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/courses"),
                        className: "text-[#C5AE79]/50 hover:text-[#C5AE79] transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                            lineNumber: 286,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 282,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold tracking-wider text-[#C5AE79]/80",
                                children: "NEBULA"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 289,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[#C5AE79]/20",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 292,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-[#C5AE79] truncate max-w-[300px]",
                                children: graphData?.course?.name || "Loading..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 293,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 288,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ml-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: "application/pdf",
                                className: "hidden",
                                ref: fileInputRef,
                                onChange: handleUpload
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 299,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-[#C5AE79]/10 border border-[#C5AE79]/30 text-[#C5AE79] rounded-lg hover:bg-[#C5AE79]/20 transition-all disabled:opacity-50",
                                children: [
                                    uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-3.5 h-3.5 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 312,
                                        columnNumber: 29
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 314,
                                        columnNumber: 29
                                    }, this),
                                    uploading ? "Analyzing..." : "Upload PDF"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 306,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 298,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 281,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative min-h-0",
                children: [
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-6 h-6 animate-spin text-[#C5AE79]"
                        }, void 0, false, {
                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                            lineNumber: 325,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 324,
                        columnNumber: 21
                    }, this) : !hasGraph ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex flex-col items-center justify-center text-center p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-2xl bg-[#C5AE79]/10 flex items-center justify-center mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    className: "w-8 h-8 text-[#C5AE79]/50"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 330,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 329,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-[#C5AE79] mb-1",
                                children: "Upload Course Material"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 332,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-[#C5AE79]/50 max-w-sm mb-4",
                                children: "Upload a PDF (syllabus, slides, or textbook) to generate your knowledge graph."
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 335,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "h-10 px-5 bg-[#C5AE79] text-[#0a0a0a] font-semibold text-sm rounded-lg shadow-[0_0_20px_rgba(197,174,121,0.3)] disabled:opacity-50",
                                children: uploading ? "Analyzing..." : "Select PDF"
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 338,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 328,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceGraph2D, {
                        ref: graphRef,
                        graphData: {
                            nodes: graphData.nodes,
                            links: graphData.links
                        },
                        nodeCanvasObject: nodeCanvasObject,
                        nodePointerAreaPaint: nodePointerAreaPaint,
                        linkCanvasObject: linkCanvasObject,
                        onNodeClick: handleNodeClick,
                        backgroundColor: "#0a0a0a",
                        nodeRelSize: 28,
                        linkWidth: 0.8,
                        linkColor: ()=>"rgba(197, 174, 121, 0.15)",
                        cooldownTicks: 100,
                        d3AlphaDecay: 0.02,
                        d3VelocityDecay: 0.3,
                        enableNodeDrag: true,
                        enableZoomInteraction: true,
                        enablePanInteraction: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 347,
                        columnNumber: 21
                    }, this),
                    hasGraph && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-4 left-4 p-3 rounded-xl bg-[#111]/90 border border-[#C5AE79]/15 backdrop-blur-md z-40",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 text-[10px] text-[#C5AE79]/70 font-medium",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full border border-white/30"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 375,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Unseen"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 376,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 374,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-[#ff0055] shadow-[0_0_6px_#ff0055]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 379,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#ff0055]",
                                            children: "Struggling"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 380,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 378,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-[#C5AE79] shadow-[0_0_6px_#C5AE79]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 383,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Exposed"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 384,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 382,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_6px_#00ffff]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 387,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#00ffff]",
                                            children: "Mastered"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                                            lineNumber: 388,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 386,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/courses/[id]/page.tsx",
                            lineNumber: 373,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 372,
                        columnNumber: 21
                    }, this),
                    drawerOpen && selectedNode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 h-full w-80 bg-[#111]/95 border-l border-[#C5AE79]/15 backdrop-blur-xl z-40 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between p-4 border-b border-[#C5AE79]/15",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-base",
                                                        children: status?.emoji
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 401,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-semibold uppercase tracking-wider",
                                                        style: {
                                                            color: getNodeColor(selectedNode.confidence)
                                                        },
                                                        children: status?.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 400,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-bold text-[#C5AE79] truncate",
                                                children: selectedNode.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 409,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-[#C5AE79]/40 capitalize",
                                                children: selectedNode.concept_type
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 399,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: closeDrawer,
                                        className: "p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
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
                                lineNumber: 398,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-4 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#C5AE79]/70 leading-relaxed",
                                        children: selectedNode.description
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 427,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-[10px] mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#C5AE79]/50 font-medium",
                                                        children: "Confidence"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-[#C5AE79]",
                                                        children: [
                                                            Math.round(selectedNode.confidence * 100),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 433,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1.5 bg-[#0a0a0a] rounded-full border border-[#C5AE79]/10 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full rounded-full transition-all duration-500",
                                                    style: {
                                                        width: `${selectedNode.confidence * 100}%`,
                                                        backgroundColor: getNodeColor(selectedNode.confidence),
                                                        boxShadow: `0 0 8px ${getNodeColor(selectedNode.confidence)}`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                    lineNumber: 440,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 439,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 432,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-[10px] font-semibold text-[#C5AE79] uppercase tracking-wider mb-2",
                                                children: "Recommended Resources"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 453,
                                                columnNumber: 33
                                            }, this),
                                            resourcesLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-[#C5AE79]/40 text-xs py-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-3 h-3 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 458,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Loading resources..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 457,
                                                columnNumber: 37
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: resources.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: r.url,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "flex items-start gap-2 p-2.5 rounded-lg bg-[#0a0a0a] border border-[#C5AE79]/10 hover:border-[#00ffff]/30 hover:bg-[#00ffff]/5 transition-all group",
                                                        children: [
                                                            r.type === "video" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                                className: "w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 472,
                                                                columnNumber: 53
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                className: "w-3.5 h-3.5 text-[#C5AE79]/50 mt-0.5 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 474,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-medium text-[#C5AE79]/80 group-hover:text-[#C5AE79] truncate",
                                                                        children: r.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                        lineNumber: 477,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-[#C5AE79]/40 mt-0.5 line-clamp-2",
                                                                        children: r.why
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                        lineNumber: 480,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 476,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                className: "w-3 h-3 text-[#C5AE79]/20 shrink-0 group-hover:text-[#00ffff]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                                lineNumber: 484,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 462,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 452,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>generatePoll(selectedNode.id),
                                        disabled: pollLoading,
                                        className: "w-full h-9 bg-[#C5AE79]/15 border border-[#C5AE79]/30 text-[#C5AE79] text-xs font-semibold rounded-lg hover:bg-[#C5AE79]/25 transition-all disabled:opacity-50",
                                        children: pollLoading ? "Generating..." : "🎯 Take Quick Poll"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 492,
                                        columnNumber: 29
                                    }, this),
                                    isDev && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-3 border-t border-[#C5AE79]/10 space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-[#C5AE79]/30 uppercase tracking-widest font-mono mb-2",
                                                children: "Dev Controls"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 503,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMastery(selectedNode.id, "correct"),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#00ffff]/30 text-[#00ffff] rounded-md hover:bg-[#00ffff]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 510,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Correct"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 506,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMastery(selectedNode.id, "wrong"),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#ff0055]/30 text-[#ff0055] rounded-md hover:bg-[#ff0055]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsDown$3e$__["ThumbsDown"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Wrong"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 512,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>updateMasteryDelta(selectedNode.id, 0.3),
                                                className: "w-full h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium border border-[#C5AE79]/30 text-[#C5AE79] rounded-md hover:bg-[#C5AE79]/10 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                        lineNumber: 522,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Simulate Exposure (+30%)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                                        lineNumber: 502,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 425,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 396,
                        columnNumber: 21
                    }, this),
                    pollModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PollModal, {
                        poll: poll,
                        loading: pollLoading,
                        nodeId: selectedNode?.id || "",
                        onClose: ()=>setPollModalOpen(false),
                        onResult: (evalResult)=>{
                            if (selectedNode) {
                                updateMastery(selectedNode.id, evalResult);
                            }
                            setPollModalOpen(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 532,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 322,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/courses/[id]/page.tsx",
        lineNumber: 279,
        columnNumber: 9
    }, this);
}
_s(CourseGraphPage, "4OIU2OJOIbg0MX2KoswkrZuLmxI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$nebulaStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNebulaStore"]
    ];
});
_c1 = CourseGraphPage;
// Poll Modal Component
function PollModal({ poll, loading, nodeId, onClose, onResult }) {
    _s1();
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showResult, setShowResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = ()=>{
        if (!selected || !poll) return;
        const isCorrect = selected === poll.correct_answer;
        setShowResult(true);
        setTimeout(()=>{
            onResult(isCorrect ? "correct" : "wrong");
        }, 1500);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#111] border border-[#C5AE79]/20 rounded-2xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]",
            children: loading || !poll ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-6 h-6 animate-spin text-[#C5AE79]"
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 581,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-3 text-sm text-[#C5AE79]/60",
                        children: "Generating question..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 582,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/courses/[id]/page.tsx",
                lineNumber: 580,
                columnNumber: 21
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-[#C5AE79] leading-snug pr-4",
                                children: poll.question
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 589,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "p-1 text-[#C5AE79]/40 hover:text-[#C5AE79] transition-colors shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/courses/[id]/page.tsx",
                                    lineNumber: 596,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 592,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 588,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 mb-5",
                        children: poll.options?.map((opt, i)=>{
                            const letter = opt[0];
                            const isThis = selected === letter;
                            const isCorrectAnswer = showResult && letter === poll.correct_answer;
                            const isWrongSelected = showResult && isThis && letter !== poll.correct_answer;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>!showResult && setSelected(letter),
                                disabled: showResult,
                                className: `w-full text-left p-3 rounded-lg text-xs border transition-all ${isCorrectAnswer ? "border-[#00ffff]/50 bg-[#00ffff]/10 text-[#00ffff]" : isWrongSelected ? "border-[#ff0055]/50 bg-[#ff0055]/10 text-[#ff0055]" : isThis ? "border-[#C5AE79]/50 bg-[#C5AE79]/10 text-[#C5AE79]" : "border-[#C5AE79]/15 text-[#C5AE79]/70 hover:border-[#C5AE79]/30"}`,
                                children: opt
                            }, i, false, {
                                fileName: "[project]/src/app/courses/[id]/page.tsx",
                                lineNumber: 609,
                                columnNumber: 37
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 600,
                        columnNumber: 25
                    }, this),
                    !showResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSubmit,
                        disabled: !selected,
                        className: "w-full h-9 bg-[#C5AE79] text-[#0a0a0a] text-xs font-bold rounded-lg disabled:opacity-30 transition-all",
                        children: "Submit Answer"
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 629,
                        columnNumber: 29
                    }, this),
                    showResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-center text-sm font-semibold py-2 ${selected === poll.correct_answer ? "text-[#00ffff]" : "text-[#ff0055]"}`,
                        children: selected === poll.correct_answer ? "✅ Correct! Mastery updated." : `❌ Wrong. Correct answer: ${poll.correct_answer}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/courses/[id]/page.tsx",
                        lineNumber: 639,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/src/app/courses/[id]/page.tsx",
            lineNumber: 578,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/courses/[id]/page.tsx",
        lineNumber: 577,
        columnNumber: 9
    }, this);
}
_s1(PollModal, "/1FuwFhUO+NEUoe3KDv+Wip1M10=");
_c2 = PollModal;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ForceGraph2D");
__turbopack_context__.k.register(_c1, "CourseGraphPage");
__turbopack_context__.k.register(_c2, "PollModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_f0449ca7._.js.map