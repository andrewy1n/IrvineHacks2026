export interface ConceptNode {
  id: string;
  label: string;
  description: string;
  confidence: number;
  status: 'not_started' | 'developing' | 'building' | 'on_track' | 'mastered';
  difficulty?: number;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: ConceptNode[];
  links: ConceptEdge[];
}

export interface Resource {
  type: 'video' | 'article' | 'practice';
  title: string;
  duration?: string;
}

export type NodeResources = Record<string, Resource[]>;
