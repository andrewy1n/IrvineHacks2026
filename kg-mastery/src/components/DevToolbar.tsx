import { useGraphStore } from '@/store/graphStore';
import { Button } from '@/components/ui/button';
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  Users,
  GraduationCap,
  Radio,
  RadioTower,
} from 'lucide-react';

export function DevToolbar() {
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const graphData = useGraphStore((s) => s.graphData);
  const simulateExposure = useGraphStore((s) => s.simulateExposure);
  const simulateMastery = useGraphStore((s) => s.simulateMastery);
  const boostAttendance = useGraphStore((s) => s.boostAttendance);
  const tutorBoost = useGraphStore((s) => s.tutorBoost);
  const mockSocketActive = useGraphStore((s) => s.mockSocketActive);
  const setMockSocketActive = useGraphStore((s) => s.setMockSocketActive);

  const exposeRandom = () => {
    if (!graphData) return;
    const notStartedNodes = graphData.nodes.filter((n) => n.status === 'not_started');
    if (notStartedNodes.length === 0) return;
    const count = Math.min(3, notStartedNodes.length);
    const shuffled = [...notStartedNodes].sort(() => Math.random() - 0.5);
    simulateExposure(shuffled.slice(0, count).map((n) => n.id));
  };

  const targetId = selectedNode?.id;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
      <span className="flex items-center text-[10px] text-gray-500 font-mono mr-2 uppercase tracking-wider font-semibold">
        Developer Tools
      </span>

      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 bg-white shadow-sm" onClick={exposeRandom}>
        <Eye className="h-3 w-3 mr-1" />
        Expose Random
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] px-2.5 bg-white shadow-sm hover:bg-green-50 hover:text-green-700 hover:border-green-200"
        disabled={!targetId}
        onClick={() => targetId && simulateMastery(targetId, 'correct')}
      >
        <ThumbsUp className="h-3 w-3 mr-1" />
        Pass Poll
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] px-2.5 bg-white shadow-sm hover:bg-red-50 hover:text-red-700 hover:border-red-200"
        disabled={!targetId}
        onClick={() => targetId && simulateMastery(targetId, 'wrong')}
      >
        <ThumbsDown className="h-3 w-3 mr-1" />
        Fail Poll
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] px-2.5 bg-white shadow-sm"
        disabled={!targetId}
        onClick={() => targetId && boostAttendance(targetId)}
      >
        <Users className="h-3 w-3 mr-1" />
        Attend Lecture (+15%)
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] px-2.5 bg-white shadow-sm"
        disabled={!targetId}
        onClick={() => targetId && tutorBoost(targetId, 0.2)}
      >
        <GraduationCap className="h-3 w-3 mr-1" />
        Tutoring (+20%)
      </Button>

      <Button
        variant={mockSocketActive ? 'default' : 'outline'}
        size="sm"
        className={`h-7 text-[11px] px-3 ml-auto shadow-sm ${mockSocketActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white'}`}
        onClick={() => setMockSocketActive(!mockSocketActive)}
      >
        {mockSocketActive ? (
          <RadioTower className="h-3.5 w-3.5 mr-1 animate-pulse" />
        ) : (
          <Radio className="h-3.5 w-3.5 mr-1 text-gray-400" />
        )}
        {mockSocketActive ? 'Live Updates ON' : 'Live Updates OFF'}
      </Button>
    </div>
  );
}
