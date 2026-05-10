interface HealthScore {
  maintainability: number;
  security: number;
  documentation: number;
  complexity: number;
  scalability: number;
}

function ScoreRing({ label, score, color }: { label: string; score: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{score}</span>
        </div>
      </div>
      <span className="text-gray-400 text-xs text-center">{label}</span>
    </div>
  );
}

export default function HealthScoreCard({ healthScore }: { healthScore: HealthScore }) {
  if (!healthScore) return null;

  const scores = [
    { label: 'Maintainability', key: 'maintainability', color: '#4f46e5' },
    { label: 'Security',        key: 'security',        color: '#10b981' },
    { label: 'Documentation',   key: 'documentation',   color: '#f59e0b' },
    { label: 'Complexity',      key: 'complexity',      color: '#8b5cf6' },
    { label: 'Scalability',     key: 'scalability',     color: '#06b6d4' },
  ];

  const avg = Math.round(
    Object.values(healthScore).reduce((a, b) => a + b, 0) / Object.values(healthScore).length
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg"> Health Score</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Overall</span>
          <span className={`text-2xl font-bold ${avg >= 75 ? 'text-green-400' : avg >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {avg}
          </span>
        </div>
      </div>
      <div className="flex justify-around flex-wrap gap-6">
        {scores.map(({ label, key, color }) => (
          <ScoreRing
            key={key}
            label={label}
            score={healthScore[key as keyof HealthScore] || 0}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}