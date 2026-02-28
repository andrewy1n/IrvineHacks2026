import { create } from 'zustand';
import type { ConceptNode, GraphData } from '@/types';
import { getStatusFromConfidence } from '@/lib/utils';
import { sampleDeepLearningGraph } from '@/data/sampleGraph';

interface GraphState {
  graphData: GraphData | null;
  selectedNode: ConceptNode | null;
  mockSocketActive: boolean;

  selectNode: (node: ConceptNode | null) => void;
  updateNodeConfidence: (nodeId: string, confidence: number) => void;
  simulateExposure: (nodeIds: string[]) => void;
  simulateMastery: (nodeId: string, result: 'correct' | 'wrong') => void;
  boostAttendance: (nodeId: string) => void;
  tutorBoost: (nodeId: string, amount: number) => void;
  setGraphData: (data: GraphData | null) => void;
  setMockSocketActive: (active: boolean) => void;
}

function updateNode(
  nodes: ConceptNode[],
  nodeId: string,
  updater: (node: ConceptNode) => Partial<ConceptNode>
): ConceptNode[] {
  return nodes.map((n) => {
    if (n.id !== nodeId) return n;
    const updates = updater(n);
    const confidence = updates.confidence ?? n.confidence;
    return { ...n, ...updates, confidence, status: getStatusFromConfidence(confidence) };
  });
}

export const useGraphStore = create<GraphState>((set, get) => ({
  graphData: null,
  selectedNode: null,
  mockSocketActive: true,

  selectNode: (node) => set({ selectedNode: node }),

  updateNodeConfidence: (nodeId, confidence) =>
    set((state) => ({
      graphData: state.graphData ? {
        ...state.graphData,
        nodes: updateNode(state.graphData.nodes, nodeId, () => ({
          confidence: Math.max(0, Math.min(1, confidence)),
        })),
      } : null,
    })),

  simulateExposure: (nodeIds) =>
    set((state) => ({
      graphData: state.graphData ? {
        ...state.graphData,
        nodes: state.graphData.nodes.map((n) => {
          if (!nodeIds.includes(n.id)) return n;
          const confidence = Math.max(n.confidence, 0.45); // 'building'
          return { ...n, confidence, status: getStatusFromConfidence(confidence) };
        }),
      } : null,
    })),

  simulateMastery: (nodeId, result) =>
    set((state) => {
      if (!state.graphData) return {};
      const newConfidence = result === 'correct' ? 0.85 : 0.2;
      const nodes = updateNode(state.graphData.nodes, nodeId, () => ({
        confidence: newConfidence,
      }));
      const updatedNode = nodes.find((n) => n.id === nodeId) ?? null;
      return {
        graphData: { ...state.graphData, nodes },
        selectedNode: get().selectedNode?.id === nodeId ? updatedNode : get().selectedNode,
      };
    }),

  boostAttendance: (nodeId) =>
    set((state) => {
      if (!state.graphData) return {};
      const nodes = updateNode(state.graphData.nodes, nodeId, (n) => ({
        confidence: Math.min(1, n.confidence + 0.15),
      }));
      const updatedNode = nodes.find((n) => n.id === nodeId) ?? null;
      return {
        graphData: { ...state.graphData, nodes },
        selectedNode: get().selectedNode?.id === nodeId ? updatedNode : get().selectedNode,
      };
    }),

  tutorBoost: (nodeId, amount) =>
    set((state) => {
      if (!state.graphData) return {};
      const nodes = updateNode(state.graphData.nodes, nodeId, (n) => ({
        confidence: Math.min(1, n.confidence + amount),
      }));
      const updatedNode = nodes.find((n) => n.id === nodeId) ?? null;
      return {
        graphData: { ...state.graphData, nodes },
        selectedNode: get().selectedNode?.id === nodeId ? updatedNode : get().selectedNode,
      };
    }),

  setGraphData: (data) => set({ graphData: data }),

  setMockSocketActive: (active) => set({ mockSocketActive: active }),
}));
