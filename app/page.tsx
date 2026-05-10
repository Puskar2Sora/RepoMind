'use client';
import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {!jobId ? (
        <LandingPage
          onAnalyze={(url, id) => {
            setRepoUrl(url);
            setJobId(id);
          }}
        />
      ) : (
        <Dashboard
          jobId={jobId}
          repoUrl={repoUrl}
          onReset={() => setJobId(null)}
        />
      )}
    </main>
  );
}