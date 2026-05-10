import { FileCode, AlertCircle } from 'lucide-react';

interface ImportantFile {
  path: string;
  reason: string;
}

export default function FileExplorer({ importantFiles }: { importantFiles: ImportantFile[] }) {
  return (
    <div className="card">
      <h3 className="text-white font-bold text-lg mb-4">📁 Important Files</h3>
      {importantFiles.length === 0 ? (
        <p className="text-gray-500 text-sm">No important files detected</p>
      ) : (
        <div className="space-y-3">
          {importantFiles.map((file, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              <FileCode size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <code className="text-green-400 text-xs block">{file.path}</code>
                <p className="text-gray-500 text-xs mt-1">{file.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}