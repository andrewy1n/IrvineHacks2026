import { useGraphStore } from '@/store/graphStore';

let intervalId: ReturnType<typeof setInterval> | null = null;

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDelay() {
  return 3000 + Math.random() * 2000;
}

function tick() {
  const { graphData, simulateExposure, simulateMastery, mockSocketActive } =
    useGraphStore.getState();

  if (!mockSocketActive || !graphData) return;

  const notStartedNodes = graphData.nodes.filter((n) => n.status === 'not_started');
  const buildingNodes = graphData.nodes.filter((n) => n.status === 'building' || n.status === 'on_track');
  const developingNodes = graphData.nodes.filter((n) => n.status === 'developing');

  const roll = Math.random();

  if (roll < 0.4 && notStartedNodes.length > 0) {
    const toExpose = pickRandom(notStartedNodes, Math.min(2, notStartedNodes.length));
    simulateExposure(toExpose.map((n) => n.id));
  } else if (roll < 0.7 && buildingNodes.length > 0) {
    const node = pickRandom(buildingNodes, 1)[0];
    simulateMastery(node.id, Math.random() > 0.3 ? 'correct' : 'wrong');
  } else if (roll < 0.85 && developingNodes.length > 0) {
    const toExpose = pickRandom(developingNodes, 1);
    simulateExposure(toExpose.map((n) => n.id));
  } else if (notStartedNodes.length > 0) {
    const toExpose = pickRandom(notStartedNodes, Math.min(3, notStartedNodes.length));
    simulateExposure(toExpose.map((n) => n.id));
  }
}

function scheduleNext() {
  intervalId = setTimeout(() => {
    tick();
    scheduleNext();
  }, randomDelay());
}

export function startMockSocket() {
  if (intervalId !== null) return;
  scheduleNext();
}

export function stopMockSocket() {
  if (intervalId !== null) {
    clearTimeout(intervalId);
    intervalId = null;
  }
}
