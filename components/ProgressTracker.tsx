'use client';
import { CheckCircle, Loader, Circle } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

interface Step {
  step: string;
  status: 'done' | 'running' | 'pending';
}

const ALL_STEPS = [
  'Cloning repository',
  'Scanning files',
  'Parsing architecture',
  'Running AI analysis',
  'Generating documentation',
  'Running security scan',
  'Building knowledge graph',
  'Ready',
];

export default function ProgressTracker({ progress }: { progress: Step[] }) {
  function getStatus(stepName: string) {
    const found = progress.find(p => p.step === stepName);
    return found?.status || 'pending';
  }

  return (
    <div className="card max-w-md w-full mx-auto">
      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        Analyzing Repository
      </h2>
               <div className="absolute inset-0 opacity-30 pointer-events-none">
  <AnimatedBackground type="dna" height={800} />
</div>
      
      <div className="space-y-4">
        {ALL_STEPS.map((step) => {
          const status = getStatus(step);
          return (
            <div key={step} className="flex items-center gap-3">
      
              {status === 'done' && (
                <CheckCircle size={18} className="text-green-400 shrink-0" />
              )}
              {status === 'running' && (
                <Loader size={18} className="text-indigo-400 animate-spin shrink-0" />
              )}
              {status === 'pending' && (
                <Circle size={18} className="text-gray-700 shrink-0" />
              )}
              <span className={`text-sm ${
                status === 'done'    ? 'text-green-400' :
                status === 'running' ? 'text-indigo-400 font-medium' :
                'text-gray-600'
              }`}>
                {step}
              </span>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}