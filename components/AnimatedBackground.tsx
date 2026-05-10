'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Props {
  type?: 'particles' | 'matrix' | 'neural' | 'waves' | 'dna' | 'grid';
  height?: number;
  className?: string;
}

export default function AnimatedBackground({
  type = 'neural',
  height = 300,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = height;
    const W = canvas.width;
    const H = canvas.height;

    let frame = 0;

    // ─── NEURAL NETWORK ───────────────────────────────────────────
    if (type === 'neural') {
      const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
      for (let i = 0; i < 60; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 3 + 1,
        });
      }
      function drawNeural() {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = '#0a0a0f';
        ctx!.fillRect(0, 0, W, H);

        nodes.forEach(n => {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
        });

        // Connections
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx!.beginPath();
              ctx!.moveTo(nodes[i].x, nodes[i].y);
              ctx!.lineTo(nodes[j].x, nodes[j].y);
              ctx!.strokeStyle = `rgba(79,70,229,${1 - dist / 120})`;
              ctx!.lineWidth = 0.5;
              ctx!.stroke();
            }
          }
        }

        // Nodes
        nodes.forEach(n => {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx!.fillStyle = '#6366f1';
          ctx!.fill();
        });

        frameRef.current = requestAnimationFrame(drawNeural);
      }
      frameRef.current = requestAnimationFrame(drawNeural);
    }

    // ─── MATRIX RAIN ──────────────────────────────────────────────
    if (type === 'matrix') {
      const cols   = Math.floor(W / 16);
      const drops  = Array(cols).fill(1);
      const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|';

      function drawMatrix() {
        ctx!.fillStyle = 'rgba(10,10,15,0.05)';
        ctx!.fillRect(0, 0, W, H);
        ctx!.fillStyle = '#4f46e5';
        ctx!.font = '14px monospace';

        drops.forEach((y, i) => {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx!.fillStyle = i % 3 === 0 ? '#a5f3fc' : '#4f46e5';
          ctx!.fillText(char, i * 16, y * 16);
          if (y * 16 > H && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        });

        frameRef.current = requestAnimationFrame(drawMatrix);
      }
      frameRef.current = requestAnimationFrame(drawMatrix);
    }

    // ─── PARTICLES ────────────────────────────────────────────────
    if (type === 'particles') {
      const particles: Particle[] = [];
      const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

      function spawn() {
        particles.push({
          x: Math.random() * W,
          y: H + 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 2 + 0.5),
          radius: Math.random() * 4 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 120 + 80,
        });
      }

      function drawParticles() {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = '#0a0a0f';
        ctx!.fillRect(0, 0, W, H);

        if (frame % 3 === 0) spawn();

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy;
          p.life++;
          p.alpha = 1 - p.life / p.maxLife;

          if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx!.fill();

          // Trail
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
          ctx!.strokeStyle = p.color + Math.floor(p.alpha * 100).toString(16).padStart(2, '0');
          ctx!.lineWidth = p.radius * 0.5;
          ctx!.stroke();
        }

        frame++;
        frameRef.current = requestAnimationFrame(drawParticles);
      }
      frameRef.current = requestAnimationFrame(drawParticles);
    }

    // ─── WAVES ────────────────────────────────────────────────────
    if (type === 'waves') {
      function drawWaves() {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = '#0a0a0f';
        ctx!.fillRect(0, 0, W, H);

        const waves = [
          { amp: 30, freq: 0.015, speed: 0.03, color: '#4f46e588', y: H * 0.5 },
          { amp: 20, freq: 0.02,  speed: 0.05, color: '#7c3aed66', y: H * 0.5 },
          { amp: 40, freq: 0.01,  speed: 0.02, color: '#06b6d444', y: H * 0.6 },
        ];

        waves.forEach(w => {
          ctx!.beginPath();
          ctx!.moveTo(0, w.y);
          for (let x = 0; x < W; x++) {
            ctx!.lineTo(x, w.y + Math.sin(x * w.freq + frame * w.speed) * w.amp);
          }
          ctx!.lineTo(W, H);
          ctx!.lineTo(0, H);
          ctx!.closePath();
          ctx!.fillStyle = w.color;
          ctx!.fill();
        });

        frame++;
        frameRef.current = requestAnimationFrame(drawWaves);
      }
      frameRef.current = requestAnimationFrame(drawWaves);
    }

    // ─── DNA ──────────────────────────────────────────────────────
    if (type === 'dna') {
      function drawDNA() {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = '#0a0a0f';
        ctx!.fillRect(0, 0, W, H);

        const cx = W / 2;
        const pairs = 20;
        const spacing = H / pairs;

        for (let i = 0; i < pairs; i++) {
          const t = frame * 0.03 + i * 0.4;
          const y = i * spacing + (spacing / 2);
          const x1 = cx + Math.sin(t) * 100;
          const x2 = cx - Math.sin(t) * 100;

          // Backbone dots
          ctx!.beginPath();
          ctx!.arc(x1, y, 5, 0, Math.PI * 2);
          ctx!.fillStyle = '#4f46e5';
          ctx!.fill();

          ctx!.beginPath();
          ctx!.arc(x2, y, 5, 0, Math.PI * 2);
          ctx!.fillStyle = '#06b6d4';
          ctx!.fill();

          // Rungs
          const alpha = Math.abs(Math.cos(t));
          ctx!.beginPath();
          ctx!.moveTo(x1, y);
          ctx!.lineTo(x2, y);
          ctx!.strokeStyle = `rgba(99,102,241,${alpha * 0.8})`;
          ctx!.lineWidth = 2;
          ctx!.stroke();

          // Glow
          const grd = ctx!.createRadialGradient(x1, y, 0, x1, y, 15);
          grd.addColorStop(0, '#4f46e544');
          grd.addColorStop(1, '#4f46e500');
          ctx!.beginPath();
          ctx!.arc(x1, y, 15, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();
        }

        frame++;
        frameRef.current = requestAnimationFrame(drawDNA);
      }
      frameRef.current = requestAnimationFrame(drawDNA);
    }

    // ─── GRID ─────────────────────────────────────────────────────
    if (type === 'grid') {
      const GRID = 40;
      const points: { x: number; y: number; pulse: number }[] = [];

      for (let x = 0; x <= W; x += GRID) {
        for (let y = 0; y <= H; y += GRID) {
          points.push({ x, y, pulse: Math.random() * Math.PI * 2 });
        }
      }

      function drawGrid() {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = '#0a0a0f';
        ctx!.fillRect(0, 0, W, H);

        // Grid lines
        ctx!.strokeStyle = '#1f2937';
        ctx!.lineWidth = 0.5;
        for (let x = 0; x <= W; x += GRID) {
          ctx!.beginPath();
          ctx!.moveTo(x, 0);
          ctx!.lineTo(x, H);
          ctx!.stroke();
        }
        for (let y = 0; y <= H; y += GRID) {
          ctx!.beginPath();
          ctx!.moveTo(0, y);
          ctx!.lineTo(W, y);
          ctx!.stroke();
        }

        // Pulsing intersection points
        points.forEach(p => {
          p.pulse += 0.04;
          const alpha = (Math.sin(p.pulse) + 1) / 2;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(79,70,229,${alpha})`;
          ctx!.fill();
        });

        // Moving highlight line
        const lineX = ((frame * 1.5) % W);
        const grd = ctx!.createLinearGradient(lineX - 60, 0, lineX + 60, 0);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.5, '#4f46e522');
        grd.addColorStop(1, 'transparent');
        ctx!.fillStyle = grd;
        ctx!.fillRect(lineX - 60, 0, 120, H);

        frame++;
        frameRef.current = requestAnimationFrame(drawGrid);
      }
      frameRef.current = requestAnimationFrame(drawGrid);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [type, height]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full rounded-xl ${className}`}
      style={{ height, display: 'block' }}
    />
  );
}