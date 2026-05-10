import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Issue {
  file: string;
  line: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

const SEVERITY_CONFIG = {
  high:   { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    icon: AlertCircle },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertTriangle },
  low:    { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',  icon: Info },
};

export default function SecurityReport({ issues, summary }: { issues: Issue[]; summary: any }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          Security Report
        </h3>
        {summary && (
          <div className="flex gap-2 text-xs">
            <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded">H:{summary.high}</span>
            <span className="text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">M:{summary.medium}</span>
            <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">L:{summary.low}</span>
          </div>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="flex items-center gap-2 text-green-400">
          <Shield size={16} />
          <span className="text-sm">No security issues detected</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {issues.map((issue, i) => {
            const cfg = SEVERITY_CONFIG[issue.severity];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`border rounded-lg p-3 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={cfg.color} />
                  <span className={`text-xs font-semibold uppercase ${cfg.color}`}>{issue.severity}</span>
                </div>
                <p className="text-gray-300 text-xs mb-1">{issue.description}</p>
                <code className="text-gray-500 text-xs">{issue.file}{issue.line ? `:${issue.line}` : ''}</code>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}