'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'How is routing handled?',
  'Where is authentication defined?',
  'How is the database connected?',
  'What are the main entry points?',
  'How do I run this project locally?',
  'What design patterns are used?',
];

export default function ChatPanel({ jobId, projectName }: { jobId: string; projectName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I've analyzed **${projectName}** and I'm ready to answer your questions. Ask me anything about the codebase!` }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(question?: string) {
    const q = question || input;
    if (!q.trim() || loading) return;

    setMessages(m => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        jobId,
        question: q,
        projectName,
      });
      setMessages(m => [...m, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I could not retrieve an answer. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-indigo-400" />
        Ask Repo Chat
      </h3>

      {/* Suggestions */}
      <div className="flex gap-2 flex-wrap mb-4">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="bg-gray-900 rounded-xl p-4 h-80 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              m.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'
            }`}>
              {m.role === 'user'
                ? <User size={14} className="text-white" />
                : <Bot size={14} className="text-indigo-400" />
              }
            </div>
            <div className={`max-w-[80%] text-sm rounded-xl px-4 py-2 ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-200'
            }`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot size={14} className="text-indigo-400" />
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 flex gap-1 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything about this repository..."
          disabled={loading}
          className="flex-1 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
