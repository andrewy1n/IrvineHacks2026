import { create } from "zustand";
import type { GraphNode, GraphData, Resource, PollData } from "@/lib/types";
import { apiFetch } from "@/lib/utils";

interface NebulaState {
    // Graph
    graphData: GraphData | null;
    loading: boolean;

    // Selection
    selectedNode: GraphNode | null;
    drawerOpen: boolean;

    // Resources
    resources: Resource[];
    resourcesLoading: boolean;

    // Poll
    poll: PollData | null;
    pollLoading: boolean;
    pollModalOpen: boolean;

    // Actions
    fetchGraph: (courseId: string) => Promise<void>;
    selectNode: (node: GraphNode | null) => void;
    closeDrawer: () => void;
    fetchResources: (conceptId: string) => Promise<void>;
    generatePoll: (conceptId: string) => Promise<void>;
    updateMastery: (conceptId: string, evalResult: string) => Promise<void>;
    updateMasteryDelta: (conceptId: string, delta: number) => Promise<void>;
    setPollModalOpen: (open: boolean) => void;
    setGraphData: (data: GraphData) => void;
}

export const useNebulaStore = create<NebulaState>((set, get) => ({
    graphData: null,
    loading: false,
    selectedNode: null,
    drawerOpen: false,
    resources: [],
    resourcesLoading: false,
    poll: null,
    pollLoading: false,
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
        set({ selectedNode: node, drawerOpen: !!node, resources: [], poll: null });
        if (node) {
            get().fetchResources(node.id);
        }
    },

    closeDrawer: () => set({ drawerOpen: false, selectedNode: null }),

    fetchResources: async (conceptId: string) => {
        set({ resourcesLoading: true });
        try {
            const res = await apiFetch(`/api/concepts/${conceptId}/resources`);
            if (res.ok) {
                const data = await res.json();
                set({ resources: data, resourcesLoading: false });
            } else {
                set({ resourcesLoading: false });
            }
        } catch {
            set({ resourcesLoading: false });
        }
    },

    generatePoll: async (conceptId: string) => {
        set({ pollLoading: true, pollModalOpen: true });
        try {
            const res = await apiFetch(`/api/concepts/${conceptId}/poll`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                set({ poll: data, pollLoading: false });
            } else {
                set({ pollLoading: false });
            }
        } catch {
            set({ pollLoading: false });
        }
    },

    updateMastery: async (conceptId: string, evalResult: string) => {
        try {
            const res = await apiFetch(`/api/mastery/${conceptId}`, {
                method: "PUT",
                body: JSON.stringify({ eval_result: evalResult }),
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

    setPollModalOpen: (open: boolean) => set({ pollModalOpen: open }),

    setGraphData: (data: GraphData) => set({ graphData: data }),
}));
