import { create } from "zustand";
import type { GraphNode, GraphData, Resource, PollData, SolvedProblem } from "@/lib/types";
import { apiFetch } from "@/lib/utils";

interface NebulaState {
    // Graph
    graphData: GraphData | null;
    loading: boolean;

    // Selection
    selectedNode: GraphNode | null;
    drawerOpen: boolean;

    // Caches
    resourcesCache: Record<string, Resource[]>;
    solvedProblemsCache: Record<string, SolvedProblem[]>;

    // Resources
    resources: Resource[];
    resourcesLoading: boolean;

    // Solved problems (questions done for this node)
    solvedProblems: SolvedProblem[];
    solvedProblemsLoading: boolean;

    // Poll
    poll: PollData | null;
    pollLoading: boolean;
    pollError: string | null;
    pollModalOpen: boolean;

    // Actions
    fetchGraph: (courseId: string) => Promise<void>;
    selectNode: (node: GraphNode | null) => void;
    closeDrawer: () => void;
    fetchResources: (conceptId: string) => Promise<void>;
    fetchSolvedProblems: (conceptId: string, forceRefresh?: boolean) => Promise<void>;
    generatePoll: (conceptId: string) => Promise<void>;
    updateMastery: (conceptId: string, evalResult: string, problem?: { question: string; options: string[]; correct_answer: string; user_answer: string }) => Promise<void>;
    updateMasteryDelta: (conceptId: string, delta: number) => Promise<void>;
    setPollModalOpen: (open: boolean) => void;
    setGraphData: (data: GraphData) => void;
}

export const useNebulaStore = create<NebulaState>((set, get) => ({
    graphData: null,
    loading: false,
    selectedNode: null,
    drawerOpen: false,
    resourcesCache: {},
    solvedProblemsCache: {},
    resources: [],
    resourcesLoading: false,
    solvedProblems: [],
    solvedProblemsLoading: false,
    poll: null,
    pollLoading: false,
    pollError: null,
    pollModalOpen: false,

    fetchGraph: async (courseId: string) => {
        set({ loading: true });
        try {
            const res = await apiFetch(`/api/courses/${courseId}/graph`);
            if (res.ok) {
                const data = await res.json();
                set({ graphData: data, loading: false });
            } else {
                set({ loading: false });
            }
        } catch {
            set({ loading: false });
        }
    },

    selectNode: (node: GraphNode | null) => {
        set({
            selectedNode: node,
            drawerOpen: !!node,
            resources: [],
            solvedProblems: [],
            poll: null,
            pollLoading: false,
            pollError: null,
        });
        if (node) {
            get().fetchResources(node.id);
            get().fetchSolvedProblems(node.id);
        }
    },

    closeDrawer: () => set({ drawerOpen: false, selectedNode: null }),

    fetchResources: async (conceptId: string) => {
        const cached = get().resourcesCache[conceptId];
        if (cached) {
            set({ resources: cached, resourcesLoading: false });
            return;
        }

        set({ resourcesLoading: true });
        try {
            const res = await apiFetch(`/api/concepts/${conceptId}/resources`);
            if (res.ok) {
                const data = await res.json();
                set((state) => ({ 
                    resources: data, 
                    resourcesLoading: false,
                    resourcesCache: { ...state.resourcesCache, [conceptId]: data }
                }));
            } else {
                set({ resourcesLoading: false });
            }
        } catch {
            set({ resourcesLoading: false });
        }
    },

    fetchSolvedProblems: async (conceptId: string, forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = get().solvedProblemsCache[conceptId];
            if (cached) {
                set({ solvedProblems: cached, solvedProblemsLoading: false });
                return;
            }
        }

        set({ solvedProblemsLoading: true });
        try {
            const res = await apiFetch(`/api/concepts/${conceptId}/solved`);
            if (res.ok) {
                const data = await res.json();
                set((state) => ({ 
                    solvedProblems: data, 
                    solvedProblemsLoading: false,
                    solvedProblemsCache: { ...state.solvedProblemsCache, [conceptId]: data }
                }));
            } else {
                set({ solvedProblems: [], solvedProblemsLoading: false });
            }
        } catch {
            set({ solvedProblems: [], solvedProblemsLoading: false });
        }
    },

    generatePoll: async (conceptId: string) => {
        if (get().pollLoading) return;
        if (get().poll) {
            set({ pollModalOpen: true, pollLoading: false, pollError: null });
            return;
        }
        set({ pollLoading: true, pollModalOpen: true, pollError: null });
        try {
            const res = await apiFetch(`/api/concepts/${conceptId}/poll`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                set({ poll: data, pollLoading: false, pollError: null, pollModalOpen: true });
            } else {
                let message = "Failed to generate a question. Please try again.";
                try {
                    const err = await res.json();
                    if (typeof err?.detail === "string" && err.detail.trim()) {
                        message = err.detail;
                    }
                } catch {
                    // keep fallback message
                }
                set({ poll: null, pollLoading: false, pollError: message, pollModalOpen: true });
            }
        } catch {
            set({
                poll: null,
                pollLoading: false,
                pollError: "Could not reach the server to generate a question.",
                pollModalOpen: true,
            });
        }
    },

    updateMastery: async (conceptId: string, evalResult: string, problem?: { question: string; options: string[]; correct_answer: string; user_answer: string }) => {
        try {
            const body: { eval_result: string; problem?: object } = { eval_result: evalResult };
            if (problem) body.problem = problem;
            const res = await apiFetch(`/api/mastery/${conceptId}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const data = await res.json();
                // Update the node confidence in the graph
                set((state) => {
                    if (!state.graphData) return {};
                    const nodes = state.graphData.nodes.map((n) =>
                        n.id === conceptId ? { ...n, confidence: data.confidence } : n
                    );
                    const updatedNode = nodes.find((n) => n.id === conceptId) || null;
                    return {
                        graphData: { ...state.graphData, nodes },
                        selectedNode: state.selectedNode?.id === conceptId ? updatedNode : state.selectedNode,
                    };
                });
                if (problem) await get().fetchSolvedProblems(conceptId, true);
            }
        } catch {
            // silent fail for MVP
        }
    },

    updateMasteryDelta: async (conceptId: string, delta: number) => {
        try {
            const res = await apiFetch(`/api/mastery/${conceptId}`, {
                method: "PUT",
                body: JSON.stringify({ delta }),
            });
            if (res.ok) {
                const data = await res.json();
                set((state) => {
                    if (!state.graphData) return {};
                    const nodes = state.graphData.nodes.map((n) =>
                        n.id === conceptId ? { ...n, confidence: data.confidence } : n
                    );
                    const updatedNode = nodes.find((n) => n.id === conceptId) || null;
                    return {
                        graphData: { ...state.graphData, nodes },
                        selectedNode: state.selectedNode?.id === conceptId ? updatedNode : state.selectedNode,
                    };
                });
            }
        } catch {
            // silent fail for MVP
        }
    },

    setPollModalOpen: (open: boolean) =>
        set(
            open
                ? { pollModalOpen: true }
                : { pollModalOpen: false, poll: null, pollLoading: false, pollError: null }
        ),

    setGraphData: (data: GraphData) => set({ graphData: data }),
}));
