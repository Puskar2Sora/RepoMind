'use client';
import { useState, useEffect } from 'react';
import { GitBranch, Zap, Brain, Shield, MessageSquare, BarChart3 } from 'lucide-react';
import axios from 'axios';
import AnimatedBackground from '@/components/AnimatedBackground';

interface Props {
  onAnalyze: (url: string, jobId: string) => void;
}

const FEATURES = [
  { icon: Brain,        title: 'AI Architecture Analysis',  desc: 'Understands your codebase structure and patterns' },
  { icon: BarChart3,    title: 'Health Score',              desc: 'Maintainability, security, and complexity scores' },
  { icon: MessageSquare,title: 'Ask Repo Chat',             desc: 'Ask any question about the repository' },
  { icon: Shield,       title: 'Security Scan',             desc: 'Detects secrets, vulnerabilities, and risks' },
  { icon: Zap,          title: 'Tech Stack Detection',      desc: 'Identifies all frameworks and libraries' },
  { icon: GitBranch,       title: 'Any GitHub Repo',           desc: 'Works with any public GitHub repository' },
];

const EXAMPLES = [
  'https://github.com/expressjs/express',
  'https://github.com/fastapi/fastapi',
  'https://github.com/vitejs/vite',
];

export default function LandingPage({ onAnalyze }: Props) {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

// Add inside the component, after the useState declarations:
useEffect(() => {
  // Wake up Render backend
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`).catch(() => {});
}, []);

  async function handleAnalyze() {
    if (!url.startsWith('https://github.com/')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, { url });
      onAnalyze(url, res.data.jobId);
    } catch (err) {
      setError('Failed to start analysis. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Brain className="text-indigo-500" size={24} />
          <span className="text-xl font-bold text-white">RepoMind</span>
        </div>
        <span className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full">
          AI Agent · Repo Analyzer
        </span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
          <Zap size={14} className="text-indigo-400" />
          <span className="text-indigo-400 text-sm">Autonomous AI Repository Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
          Understand Any
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            GitHub Repo
          </span>
          Instantly
        </h1>

        <p className="text-gray-400 text-lg text-center max-w-2xl mb-12">
          RepoMind is an autonomous AI agent that clones, analyzes, and explains
          any GitHub repository — architecture, tech stack, health scores, and more.
        </p>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
  <AnimatedBackground type="neural" height={600} />
</div>
        {/* Input */}
        <div className="w-full max-w-2xl">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
              <GitBranch size={20} className="text-gray-500 shrink-0" />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="https://github.com/username/repository"
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Analyze
                </>
              )}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Example repos */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-3">
            <span className="text-gray-600 text-xs">Try:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setUrl(ex)}
                className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 px-2 py-1 rounded-md transition-colors"
              >
                {ex.replace('https://github.com/', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-20 max-w-4xl w-full">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-indigo-500/50 transition-colors group">
              <Icon size={20} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}