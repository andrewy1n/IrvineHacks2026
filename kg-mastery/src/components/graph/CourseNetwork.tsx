import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { motion } from "motion/react";
import useMeasure from "react-use-measure";
import { formatLastUpdated } from "@/lib/utils";

import { Trash2 } from "lucide-react";

interface Course {
  id: string;
  name: string;
  created_at: string;
  masteryPercentage?: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  created_at: string;
  masteryPercentage: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

export function CourseNetwork({ courses, onDelete }: { courses: Course[]; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const [containerRef, bounds] = useMeasure();
  const { width, height } = bounds;

  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const dynamicScale = useMemo(() => {
    // Fewer courses = bigger, more courses = smaller
    return Math.max(0.6, Math.min(1.2, 2.5 / Math.max(1, Math.sqrt(courses.length))));
  }, [courses.length]);

  // Generate a random network of connections
  const networkData = useMemo(() => {
    const nodes: SimNode[] = courses.map((course) => {
      const masteryPercentage = course.masteryPercentage ?? 0;
      return {
        ...course,
        masteryPercentage,
        x: undefined,
        y: undefined,
      };
    });

    const links: SimLink[] = [];
    if (nodes.length > 1) {
      // Connect each node to 1 or 2 other random nodes to make it look like a network
      for (let i = 0; i < nodes.length; i++) {
        const targetCount = Math.min(Math.floor(Math.random() * 2) + 1, nodes.length - 1);
        const availableTargets = nodes.filter((_, idx) => idx !== i);
        
        // Shuffle and pick
        const targets = availableTargets.sort(() => 0.5 - Math.random()).slice(0, targetCount);
        targets.forEach(target => {
          // Avoid duplicate links
          const exists = links.some(
            l => (l.source === nodes[i].id && l.target === target.id) || 
                 (l.source === target.id && l.target === nodes[i].id)
          );
          if (!exists) {
            links.push({ source: nodes[i].id, target: target.id });
          }
        });
      }
      
      // Ensure the graph is fully connected
      for (let i = 1; i < nodes.length; i++) {
        links.push({ source: nodes[i - 1].id, target: nodes[i].id });
      }
    }

    return { nodes, links };
  }, [courses]);

  useEffect(() => {
    if (!width || !height || networkData.nodes.length === 0) return;

    // Center the simulation
    const cx = width / 2;
    const cy = height / 2;

    const simulation = d3
      .forceSimulation<SimNode>(networkData.nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(networkData.links)
          .id((d) => d.id)
          .distance(200 * dynamicScale) // Shorter distance to keep compact
      )
      .force("charge", d3.forceManyBody().strength(-800 * dynamicScale)) // Less repulsion
      .force("center", d3.forceCenter(cx, cy))
      .force("x", d3.forceX(cx).strength(0.05)) // Gently pull towards horizontal center
      .force("y", d3.forceY(cy).strength(0.05)) // Gently pull towards vertical center
      .force("collide", d3.forceCollide().radius(140 * dynamicScale))
      .on("tick", () => {
        // Generous padding to account for the card width (w-48 = 192px)
        const paddingX = 150 * dynamicScale;
        const paddingY = 100 * dynamicScale;
        
        // Keep nodes strictly inside bounds
        simulation.nodes().forEach(node => {
          if (node.x != null) node.x = Math.max(paddingX, Math.min(width - paddingX, node.x));
          if (node.y != null) node.y = Math.max(paddingY, Math.min(height - paddingY, node.y));
        });
        
        setSimNodes([...simulation.nodes()]);
        setSimLinks([...networkData.links]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [width, height, networkData, dynamicScale]);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-zinc-500 mb-4 tracking-wide uppercase text-sm">
          No constellations found in this galaxy.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[600px] relative rounded-2xl overflow-hidden mt-6">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g>
          {simLinks.map((link, i) => {
            const source = typeof link.source === "object" ? link.source : simNodes.find((n) => n.id === link.source);
            const target = typeof link.target === "object" ? link.target : simNodes.find((n) => n.id === link.target);

            if (!source || !target || source.x == null || target.x == null || source.y == null || target.y == null)
              return null;

            return (
              <motion.line
                key={`link-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}
        </g>
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {simNodes.map((node) => {
          if (node.x == null || node.y == null) return null;

          return (
            <motion.div
              key={node.id}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center group"
              style={{
                left: node.x,
                top: node.y,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.5 * dynamicScale, opacity: 0, filter: "brightness(2)" }}
              animate={{ scale: dynamicScale, opacity: 1, filter: "brightness(1)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              onClick={() => navigate(`/courses/${node.id}`)}
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 w-32 h-32 -left-16 -top-16 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Main Node */}
              <div className="relative z-10 w-48 rounded-xl border border-white/20 bg-white/[0.05] p-4 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all group-hover:bg-white/[0.1] group-hover:border-white/50 group-hover:scale-105 group-hover:-translate-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="absolute -top-3 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 text-red-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all backdrop-blur-xl"
                  title="Delete Constellation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white/90 group-hover:text-white tracking-wide text-center">
                  {node.name}
                </h3>
                
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-between text-[10px] text-white/70 uppercase tracking-widest">
                    <span>Mastery</span>
                    <span className="font-medium text-white">{node.masteryPercentage}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      style={{ width: `${node.masteryPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
