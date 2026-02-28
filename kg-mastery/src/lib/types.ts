export interface GraphNode {
    id: string;
    label: string;
    description: string;
    concept_type: "concept" | "process" | "formula";
    confidence: number;
    // Force graph props (added at runtime)
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

export interface GraphLink {
    id: string;
    source: string | GraphNode;
    target: string | GraphNode;
    relationship: string;
}

export interface GraphData {
    course: { id: string; name: string };
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface Resource {
    title: string;
    url: string;
    type: "video" | "article";
    why: string;
}

export interface PollData {
    question: string;
    options: string[];
    correct_answer: string;
}
