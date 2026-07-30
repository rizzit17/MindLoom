import React, { useState, useId } from 'react';
import { Terminal, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface InputPanelProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_TEXTS = [
  {
    label: 'MICROSERVICES_ARCH',
    text: `Microservices architecture decomposes a software application into small, independent services that communicate over lightweight protocols like HTTP/REST or gRPC. Each service is owned by a small team and focused on a single business capability. Core benefits include independent scalability, technology flexibility, isolated deployments, and fault isolation. Key operational challenges involve distributed logging, API gateway routing, data consistency, and service mesh management.`,
  },
  {
    label: 'AI_AND_MACHINE_LEARNING',
    text: `Artificial intelligence empowers computer systems to perform tasks traditionally requiring human cognition, such as visual perception, natural language processing, decision-making, and autonomous navigation. Machine learning is a core subset focused on algorithms that learn patterns directly from datasets without explicit programming. Deep neural networks, supervised learning, reinforcement learning, and modern transformer architectures drive modern advances in generative AI.`,
  },
  {
    label: 'DEVOPS_CICD_PIPELINE',
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
    <div className="bg-surface border-2 border-border shadow-[4px_4px_0px_var(--border)] p-5 font-mono flex flex-col gap-4">
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-accent" />
          <h2 className="text-base font-display font-black tracking-tight uppercase text-ink">
            SOURCE_DOCUMENT // INPUT
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-ink">
          <span>{charCount} / 12,000 CHARS</span>
          <span className="bg-bg border border-border px-2 py-0.5 font-bold">
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
            className="w-full h-40 p-4 border-2 border-border bg-bg text-ink placeholder-ink/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none text-sm leading-relaxed font-mono"
            style={{ borderRadius: '0px' }}
          />
          {isTruncated && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs bg-amber-500 text-black border border-border px-2.5 py-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>TEXT EXCEEDS 12,000 CHARS (WILL TRUNCATE)</span>
            </div>
          )}
        </div>

        {isTooShort && (
          <p className="text-xs text-accent font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-accent" />
            Please enter at least 20 characters for meaningful mindmap extraction.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 mt-1 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            <span className="text-xs font-bold text-ink uppercase">PRESETS:</span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => setText(sample.text)}
                className="brutal-btn text-xs px-2.5 py-1 disabled:opacity-50 whitespace-nowrap"
              >
                [{sample.label}]
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="brutal-btn-accent px-6 py-2.5 text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>Generate Mindmap</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
