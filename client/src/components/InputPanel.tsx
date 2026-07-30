import React, { useState, useId } from 'react';
import { Sparkles, AlertTriangle, FileText, Loader2 } from 'lucide-react';

interface InputPanelProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_TEXTS = [
  {
    label: 'Microservices Architecture',
    text: `Microservices architecture decomposes a software application into small, independent services that communicate over lightweight protocols like HTTP/REST or gRPC. Each service is owned by a small team and focused on a single business capability. Core benefits include independent scalability, technology flexibility, isolated deployments, and fault isolation. Key operational challenges involve distributed logging, API gateway routing, data consistency, and service mesh management.`,
  },
  {
    label: 'Artificial Intelligence & ML',
    text: `Artificial intelligence empowers computer systems to perform tasks traditionally requiring human cognition, such as visual perception, natural language processing, decision-making, and autonomous navigation. Machine learning is a core subset focused on algorithms that learn patterns directly from datasets without explicit programming. Deep neural networks, supervised learning, reinforcement learning, and modern transformer architectures drive modern advances in generative AI.`,
  },
  {
    label: 'DevOps & CI/CD Pipeline',
    text: `DevOps is a set of practices combining software development and IT operations to shorten the development lifecycle and provide continuous delivery with high software quality. Continuous Integration (CI) automatically builds and runs automated tests whenever code changes are pushed. Continuous Deployment (CD) automates releasing validated code into production environments, utilizing containerization with Docker and orchestration with Kubernetes.`,
  },
];

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const textareaId = useId();

  const charCount = text.length;
  const tokenEstimate = Math.ceil(charCount / 4);
  const isTooShort = text.trim().length > 0 && text.trim().length < 20;
  const isTruncated = charCount > 12000;
  const isDisabled = isLoading || text.trim().length === 0 || isTooShort;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      onGenerate(text);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col gap-4 border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold tracking-wide text-slate-100">Source Document</h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>{charCount} / 12,000 chars</span>
          <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded-full border border-slate-700">
            ~{tokenEstimate} tokens
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder="Paste your document, notes, or article text here to generate an interactive mindmap..."
            className="w-full h-44 p-4 rounded-xl bg-slate-900/80 text-slate-100 placeholder-slate-500 border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
          />
          {isTruncated && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60 backdrop-blur">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Input exceeds 12,000 chars and will be truncated</span>
            </div>
          )}
        </div>

        {isTooShort && (
          <p className="text-xs text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Please enter at least 20 characters for meaningful mindmap extraction.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-slate-400 whitespace-nowrap">Presets:</span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => setText(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Mindmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Generate Mindmap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
