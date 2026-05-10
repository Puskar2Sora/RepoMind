'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProgressTracker from './ProgressTracker';
import DependencyGraph from './DependencyGraph';
import SummaryCard from './SummaryCard';
import TechStackCard from './TechStackCard';
import HealthScoreCard from './HealthScoreCard';
import ArchitectureView from './ArchitectureView';
import FileExplorer from './FileExplorer';
import SecurityReport from './SecurityReport';
import ChatPanel from './ChatPanel';
import { Brain, RotateCcw } from 'lucide-react';

interface Props {
  jobId: string;
  repoUrl: string;
  onReset: () => void;
}

export default function Dashboard({ jobId, repoUrl, onReset }: Props) {
  const [status, setStatus]   = useState('running');
  const [progress, setProgress] = useState([]);
  const [report, setReport]   = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/status/${jobId}`);
        setProgress(res.data.progress || []);
        setStatus(res.data.status);

        if (res.data.status === 'done') {
          setReport(res.data.report);
          clearInterval(interval);
        }
        if (res.data.status === 'error') {
          clearInterval(interval);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Brain className="text-indigo-500" size={20} />
          <span className="font-bold text-white">RepoMind</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm truncate max-w-xs">{repoUrl}</span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            New Repo
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading state */}
        {status === 'running' && (
          <div className="flex justify-center py-20">
            <ProgressTracker progress={progress} />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-400 text-lg">Analysis failed. Please try again.</p>
            <button onClick={onReset} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">
              Try Again
            </button>
          </div>
        )}

        {/* Report */}
        {status === 'done' && report && (
          <div className="space-y-6">
            {/* Row 1 - Summary + Tech Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryCard report={report} />
              <TechStackCard techStack={report.techStack || []} />
            </div>

            {/* Row 2 - Health Scores */}
            <HealthScoreCard healthScore={report.healthScore} />

            {/* Row 3 - Architecture */}
            <ArchitectureView
              architecture={report.architecture}
              mermaidDiagram={report.generatedDocs?.mermaidDiagram}
            />
            {/* Dependency Graph */}
            <DependencyGraph jobId={jobId} />
            {/* Row 4 - Files + Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileExplorer importantFiles={report.importantFiles || []} />
              <SecurityReport
                issues={report.securityIssues || []}
                summary={report.securitySummary}
              />
            </div>

            {/* Row 5 - Chat */}
            <ChatPanel
              jobId={jobId}
              projectName={report.projectName}
            />

            {/* Row 6 - Improvements */}
            {report.improvements?.length > 0 && (
              <div className="card">
                <h3 className="text-white font-bold text-lg mb-4"> Improvement Suggestions</h3>
                <ul className="space-y-3">
                  {report.improvements.map((imp: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}