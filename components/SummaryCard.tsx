import { GitBranch, Target, Layers } from 'lucide-react';

export default function SummaryCard({ report }: { report: any }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-indigo-400" />
        <h3 className="text-white font-bold text-lg">{report.projectName}</h3>
      </div>
      <p className="text-indigo-300 text-sm font-medium mb-3">{report.purpose}</p>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{report.summary}</p>

      {report.entryPoints?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={14} className="text-gray-500" />
            <span className="text-gray-500 text-xs font-medium">Entry Points</span>
          </div>
          {report.entryPoints.map((ep: string) => (
            <code key={ep} className="block text-xs text-green-400 bg-gray-900 px-2 py-1 rounded mt-1">
              {ep}
            </code>
          ))}
        </div>
      )}

      {report.patterns?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-gray-500" />
            <span className="text-gray-500 text-xs font-medium">Patterns</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.patterns.map((p: string) => (
              <span key={p} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}