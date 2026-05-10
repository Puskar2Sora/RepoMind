'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

interface Node {
  id: string;
  type: 'Entry' | 'File' | 'Tech' | 'Dependency' | 'Plugins';
  label: string;
  reason?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: string;
}

const NODE_COLORS: Record<string, string> = {
  entry:      '#4f46e5',
  file:       '#10b981',
  tech:       '#f59e0b',
  dependency: '#8b5cf6',
  pattern:    '#06b6d4',
};

const NODE_SIZES: Record<string, number> = {
  entry:      20,
  file:       14,
  tech:       18,
  dependency: 12,
  pattern:    16,
};

const NODE_ICONS: Record<string, string> = {
  entry:      '',
  file:       '',
  tech:       '',
  dependency: '',
  pattern:    '',
};

const TYPE_LABELS: Record<string, string> = {
  entry:      'Entry Point',
  file:       'File',
  tech:       'Tech',
  dependency: 'Package',
  pattern:    'Plugins',
};

export default function DependencyGraph({ jobId }: { jobId: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const simRef       = useRef<any>(null);

  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[]; metadata: any } | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selected, setSelected]   = useState<Node | null>(null);
  const [filter, setFilter]       = useState('all');
  const [zoom, setZoom]           = useState(1);
  const [offset, setOffset]       = useState({ x: 0, y: 0 });
  const isDragging   = useRef(false);
  const dragNode     = useRef<Node | null>(null);
  const lastMouse    = useRef({ x: 0, y: 0 });
  const panStart     = useRef({ x: 0, y: 0 });
  const isPanning    = useRef(false);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/graph/${jobId}`
        );
        setGraphData(res.data);
      } catch {
        setError('Could not load graph data');
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, [jobId]);

  // Simple force simulation (no D3 needed)
  function runSimulation(nodes: Node[], links: Link[]) {
    const WIDTH  = containerRef.current?.clientWidth  || 800;
    const HEIGHT = 520;

    // Initial positions in circle
    nodes.forEach((n, i) => {
      if (n.x === undefined) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const r = Math.min(WIDTH, HEIGHT) * 0.3;
        n.x  = WIDTH  / 2 + r * Math.cos(angle);
        n.y  = HEIGHT / 2 + r * Math.sin(angle);
        n.vx = 0;
        n.vy = 0;
      }
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    function tick() {
      const alpha = 0.08;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (200 * 200) / (dist * dist);
          const fx = (dx / dist) * force * alpha;
          const fy = (dy / dist) * force * alpha;
          a.vx! -= fx; a.vy! -= fy;
          b.vx! += fx; b.vy! += fy;
        }
      }

      // Attraction along links
      links.forEach(l => {
        const src = typeof l.source === 'string' ? nodeMap.get(l.source) : l.source as Node;
        const tgt = typeof l.target === 'string' ? nodeMap.get(l.target) : l.target as Node;
        if (!src || !tgt) return;
        const dx = (tgt.x || 0) - (src.x || 0);
        const dy = (tgt.y || 0) - (src.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 120;
        const force = (dist - target) * 0.03;
        src.vx! += dx / dist * force;
        src.vy! += dy / dist * force;
        tgt.vx! -= dx / dist * force;
        tgt.vy! -= dy / dist * force;
      });

      // Center gravity
      nodes.forEach(n => {
        n.vx! += ((WIDTH / 2) - (n.x || 0)) * 0.002;
        n.vy! += ((HEIGHT / 2) - (n.y || 0)) * 0.002;
      });

      // Apply velocity
      nodes.forEach(n => {
        if (n.fx !== null && n.fx !== undefined) { n.x = n.fx; n.vx = 0; return; }
        n.vx! *= 0.85;
        n.vy! *= 0.85;
        n.x! += n.vx!;
        n.y! += n.vy!;
        n.x = Math.max(30, Math.min(WIDTH - 30, n.x!));
        n.y = Math.max(30, Math.min(HEIGHT - 30, n.y!));
      });
    }

    return { tick, nodeMap };
  }

  // Canvas render
  const render = useCallback((
    nodes: Node[], links: Link[],
    nodeMap: Map<string, Node>,
    canvas: HTMLCanvasElement,
    zoomVal: number, off: { x: number; y: number },
    sel: Node | null
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(off.x, off.y);
    ctx.scale(zoomVal, zoomVal);

    // Draw links
    links.forEach(l => {
      const src = typeof l.source === 'string' ? nodeMap.get(l.source) : l.source as Node;
      const tgt = typeof l.target === 'string' ? nodeMap.get(l.target) : l.target as Node;
      if (!src?.x || !tgt?.x) return;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y!);
      ctx.lineTo(tgt.x, tgt.y!);
      ctx.strokeStyle = NODE_COLORS[src.type] + '55';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(tgt.y! - src.y!, tgt.x - src.x);
      const r = NODE_SIZES[tgt.type] + 4;
      const ax = tgt.x - Math.cos(angle) * r;
      const ay = tgt.y! - Math.sin(angle) * r;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = NODE_COLORS[src.type] + '88';
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach(n => {
      if (!n.x) return;
      const r    = NODE_SIZES[n.type];
      const col  = NODE_COLORS[n.type];
      const isSel = sel?.id === n.id;

      // Glow
      if (isSel) {
        ctx.beginPath();
        ctx.arc(n.x, n.y!, r + 10, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(n.x, n.y!, r, n.x, n.y!, r + 10);
        grd.addColorStop(0, col + '66');
        grd.addColorStop(1, col + '00');
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(n.x, n.y!, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = col + (isSel ? 'cc' : '44');
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.stroke();

      // Fill
      ctx.beginPath();
      ctx.arc(n.x, n.y!, r, 0, Math.PI * 2);
      ctx.fillStyle = col + 'dd';
      ctx.fill();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${Math.max(9, r * 0.6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(NODE_ICONS[n.type], n.x, n.y!);

      // Name below
      ctx.font = '9px monospace';
      ctx.fillStyle = isSel ? '#fff' : '#94a3b8';
      const label = n.label.length > 14 ? n.label.slice(0, 14) + '…' : n.label;
      ctx.fillText(label, n.x, n.y! + r + 12);
    });

    ctx.restore();
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (!graphData || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const W = containerRef.current.clientWidth;
    const H = 520;
    canvas.width  = W;
    canvas.height = H;

    const filtered = filter === 'all'
      ? graphData.nodes
      : graphData.nodes.filter(n => n.type === filter);
    const filteredIds = new Set(filtered.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as Node).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as Node).id;
      return filteredIds.has(s) && filteredIds.has(t);
    });

    // Reset positions on filter change
    filtered.forEach(n => { n.x = undefined as any; });

    const { tick, nodeMap } = runSimulation(filtered, filteredLinks);
    simRef.current = { nodes: filtered, links: filteredLinks, nodeMap };

    let frame = 0;
    function loop() {
      if (frame < 300) { tick(); frame++; }
      render(filtered, filteredLinks, nodeMap, canvas, zoom, offset, selected);
      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [graphData, filter, zoom, offset, selected, render]);

  // Mouse interactions
  function getNodeAt(x: number, y: number): Node | null {
    if (!simRef.current) return null;
    const { nodes } = simRef.current;
    const wx = (x - offset.x) / zoom;
    const wy = (y - offset.y) / zoom;
    for (const n of nodes) {
      const dx = (n.x || 0) - wx;
      const dy = (n.y || 0) - wy;
      if (Math.sqrt(dx * dx + dy * dy) < NODE_SIZES[n.type] + 6) return n;
    }
    return null;
  }

  function onMouseDown(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = getNodeAt(mx, my);
    if (hit) {
      isDragging.current = true;
      dragNode.current = hit;
      hit.fx = hit.x;
      hit.fy = hit.y;
    } else {
      isPanning.current = true;
      panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
    lastMouse.current = { x: mx, y: my };
  }

  function onMouseMove(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (isDragging.current && dragNode.current) {
      dragNode.current.fx = (mx - offset.x) / zoom;
      dragNode.current.fy = (my - offset.y) / zoom;
      dragNode.current.x  = dragNode.current.fx;
      dragNode.current.y  = dragNode.current.fy;
    } else if (isPanning.current) {
      setOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
  }

  function onMouseUp(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = Math.abs(mx - lastMouse.current.x);
    const dy = Math.abs(my - lastMouse.current.y);
    if (dx < 5 && dy < 5) {
      const hit = getNodeAt(mx, my);
      setSelected(hit);
    }
    if (dragNode.current) { dragNode.current.fx = null; dragNode.current.fy = null; }
    isDragging.current = false;
    dragNode.current = null;
    isPanning.current = false;
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-white font-bold text-lg">Dependency Graph</h3>
        {graphData?.metadata && (
          <div className="flex gap-2 text-xs">
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">{graphData.nodes.length} nodes</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">{graphData.links.length} connections</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">{graphData.metadata.totalDeps} packages</span>
          </div>
        )}
      </div>

      {/* Filters */}
      {graphData && (
        <div className="flex gap-2 flex-wrap mb-4">
          {['all', 'entry', 'file', 'tech', 'dependency', 'pattern'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400'
              }`}>
              {f === 'all' ? '🌐 All' : TYPE_LABELS[f]}
            </button>
          ))}
          <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-gray-500 ml-auto">
            Reset View
          </button>
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-gray-800" style={{ height: 520 }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-3">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Building graph...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onWheel={onWheel}
              style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            />
            <div className="absolute bottom-3 right-3 text-gray-600 text-xs bg-gray-900/80 px-2 py-1 rounded">
              Scroll to zoom · Drag to pan · Click node for info
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} />
            <span className="text-gray-500 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected info */}
      {selected && (
        <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: NODE_COLORS[selected.type] + '20', color: NODE_COLORS[selected.type] }}>
              {TYPE_LABELS[selected.type]}
            </span>
            <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
          </div>
          <code className="text-green-400 text-sm block mb-1">{selected.label}</code>
          <p className="text-gray-500 text-xs">{selected.id}</p>
          {selected.reason && (
            <p className="text-gray-400 text-xs mt-2 border-t border-gray-800 pt-2">{selected.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
