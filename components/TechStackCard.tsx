const TECH_COLORS: Record<string, string> = {
  'React': 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  'Next.js': 'bg-white/10 text-white border-white/20',
  'TypeScript': 'bg-blue-600/10 text-blue-400 border-blue-600/30',
  'JavaScript': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  'Node.js': 'bg-green-500/10 text-green-300 border-green-500/30',
  'Python': 'bg-yellow-600/10 text-yellow-400 border-yellow-600/30',
  'Express': 'bg-gray-500/10 text-gray-300 border-gray-500/30',
  'MongoDB': 'bg-green-600/10 text-green-400 border-green-600/30',
  'PostgreSQL': 'bg-blue-700/10 text-blue-300 border-blue-700/30',
  'Docker': 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  'Tailwind CSS': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  'default': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
};

export default function TechStackCard({ techStack }: { techStack: string[] }) {
  return (
    <div className="card">
      <h3 className="text-white font-bold text-lg mb-4">🛠 Tech Stack</h3>
      {techStack.length === 0 ? (
        <p className="text-gray-500 text-sm">No tech stack detected</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech: string) => {
            const colorClass = TECH_COLORS[tech] || TECH_COLORS['default'];
            return (
              <span
                key={tech}
                className={`text-sm font-medium border px-3 py-1.5 rounded-full ${colorClass}`}
              >
                {tech}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}