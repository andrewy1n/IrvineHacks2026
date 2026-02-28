# KG Mastery — Knowledge Graph Mastery Frontend

Interactive force-directed knowledge graph for tracking student concept mastery. Simulates a Chrome extension side panel at 400px width with dark theme.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 (dark mode)
- shadcn/ui components (Button, Input, Dialog, Label)
- react-force-graph-2d + d3-force
- Zustand for state management
- Lucide React icons
- Mock Socket.IO event simulation

## Setup

```bash
cd kg-mastery
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Features

### Knowledge Graph
- 35 deep learning concept nodes with prerequisite/relationship edges
- Nodes colored by mastery status:
  - **Grey** — not yet seen
  - **Yellow** — exposed (seen in lecture/material)
  - **Green** — mastered (passed quiz/poll)
  - **Red** — needs review (failed quiz or low confidence)
- Click any node to open the details panel
- Hover any node for a quick status tooltip
- Drag, zoom, and pan the graph

### Node Details Panel
- Slides up from the bottom when a node is clicked
- Shows: name, status badge, description, confidence progress bar
- Lists 3 recommended resources (video, article, practice)
- "Take Quick Poll" button — randomly simulates correct/wrong
- "Mark as Mastered" button — sets confidence to 100%

### Dev Toolbar
- **Expose** — picks random grey nodes and sets them to yellow
- **Correct / Wrong** — requires a selected node; simulates poll results
- **Attend** — boosts selected node confidence by +0.15
- **Tutor +.2** — boosts selected node confidence by +0.20
- **Live / Paused** toggle — controls the auto-updating mock socket

### Mock Socket
- Simulates real-time backend events every 3-5 seconds
- Randomly exposes grey nodes, masters yellow nodes, or re-exposes red nodes
- Toggle on/off via the dev toolbar

## Project Structure

```
src/
├── components/
│   ├── KnowledgeGraph.tsx   # ForceGraph2D wrapper
│   ├── NodeDetails.tsx      # Slide-up detail panel
│   ├── DevToolbar.tsx       # Testing buttons
│   └── ui/                  # shadcn components
├── store/graphStore.ts      # Zustand state
├── services/mockSocket.ts   # Simulated real-time events
├── data/sampleGraph.ts      # 35 nodes + edges + resources
├── lib/utils.ts             # cn(), color logic, status helpers
├── types.ts                 # ConceptNode, ConceptEdge, GraphData
├── App.tsx                  # Main layout
└── main.tsx                 # Entry point
```

## Testing Flows

1. **Exposure flow**: Click "Expose" in dev toolbar — grey nodes turn yellow
2. **Mastery flow**: Click a yellow node, then "Correct" — turns green
3. **Gap flow**: Click a node, then "Wrong" — turns red
4. **Attendance boost**: Click a node, then "Attend" — confidence +0.15
5. **Tutoring boost**: Click a node, then "Tutor +.2" — confidence +0.20
6. **Auto simulation**: Leave "Live" on and watch nodes change automatically
