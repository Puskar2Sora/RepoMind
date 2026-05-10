'use client';
import { useEffect, useRef } from 'react';

export default function ArchitectureView({ architecture, mermaidDiagram }: {
  architecture: string;
  mermaidDiagram?: string;
}) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mermaidDiagram || !mermaidRef.current) return;
    import('mermaid').then(m => {
      m.default.initialize({ startOnLoad: false, theme: 'dark' });
      m.default.render('arch-diagram', mermaidDiagram).then(({ svg }) => {
        if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
      }).catch(() => {});
    });
  }, [mermaidDiagram]);

  return (
    <div className="card">
      <h3 className="text-white font-bold text-lg mb-4">Architecture</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">{architecture}</p>
      {mermaidDiagram && (
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <div ref={mermaidRef} className="flex justify-center" />
        </div>
      )}
    </div>
  );
}