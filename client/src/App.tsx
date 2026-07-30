import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { mindmapApi } from './services/api';
import { InputPanel } from './components/InputPanel';
import { MindmapCanvas } from './components/MindmapCanvas';
import { SummaryPanel } from './components/SummaryPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { Toast, ToastMessage } from './components/Toast';
import { Sun, Moon, Terminal, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppContent: React.FC = () => {
  const [currentMindmap, setCurrentMindmap] = useState<Mindmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Sync dark/light mode class on root html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch generation history
  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['mindmaps-history'],
    queryFn: mindmapApi.getMindmaps,
  });

  // Generate mindmap mutation
  const generateMutation = useMutation({
    mutationFn: mindmapApi.generateMindmap,
    onSuccess: (data) => {
      setCurrentMindmap(data);
      // Auto-select root node if available
      const rootNode = data.nodes.find((n) => n.id === data.rootId || n.isRoot);
      setSelectedNode(rootNode || data.nodes[0] || null);

      refetchHistory();

      if (data.truncated) {
        setToast({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Input Text Truncated',
          message: 'Your input text exceeded the 12,000 character limit and was truncated before sending to the LLM.',
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'info',
          title: 'Mindmap Generated Successfully',
          message: `Extracted ${data.nodes.length} nodes from input text.`,
        });
      }
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          setToast({
            id: Date.now().toString(),
            type: 'error',
            title: 'Invalid Request Input (400)',
            message: data.error || 'The text provided was empty or too short.',
          });
        } else if (status === 422) {
          setToast({
            id: Date.now().toString(),
            type: 'error',
            title: 'Domain Rule Validation Failed (422)',
            message: data.error || 'LLM output failed strict domain validation after repair attempt.',
            details: data.details,
          });
        } else {
          setToast({
            id: Date.now().toString(),
            type: 'error',
            title: `Error (${status})`,
            message: data.error || 'An unexpected error occurred while contacting the server.',
          });
        }
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to reach backend API. Please ensure the server is running on http://localhost:3001',
        });
      }
    },
  });

  const handleSelectHistoryItem = async (id: string) => {
    try {
      const mindmap = await mindmapApi.getMindmapById(id);
      setCurrentMindmap(mindmap);
      const rootNode = mindmap.nodes.find((n) => n.id === mindmap.rootId || n.isRoot);
      setSelectedNode(rootNode || mindmap.nodes[0] || null);
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Failed to Load Mindmap',
        message: `Could not retrieve saved mindmap with ID '${id}'.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-mono selection:bg-accent selection:text-white">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <HistorySidebar
        history={history}
        selectedId={currentMindmap?.id || null}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((prev) => !prev)}
        onSelectMindmap={handleSelectHistoryItem}
      />

      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-surface border-b-2 border-border px-6 py-4 flex items-center justify-between shadow-[0_4px_0_var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent border-2 border-border text-white shadow-[2px_2px_0px_var(--border)]">
            <Terminal className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight text-ink uppercase flex items-center gap-2 leading-none">
              VISUALLI <span className="bg-bg border border-border text-xs font-mono font-bold px-2 py-0.5 text-accent uppercase">[MINI_MINDMAP]</span>
            </h1>
            <p className="text-xs font-mono text-ink/70 mt-1 uppercase font-bold">
              [ STRUCTURAL LLM SCHEMA ENGINE ]
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-ink bg-bg border-2 border-border px-3 py-1 shadow-[2px_2px_0px_var(--border)]">
            <span className="text-accent">[AI]</span>
            <span>STRICT ZOD + DOMAIN REPAIR</span>
          </div>

          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="brutal-btn p-2 text-ink flex items-center justify-center"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-accent-secondary" />}
          </button>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        <InputPanel
          onGenerate={(text) => generateMutation.mutate(text)}
          isLoading={generateMutation.isPending}
        />

        {currentMindmap?.truncated && (
          <div className="p-3 bg-amber-500 text-black border-2 border-border font-mono text-xs font-bold shadow-[3px_3px_0px_var(--border)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              [TRUNCATION_WARNING] INPUT TEXT EXCEEDED 12,000 CHARACTERS AND WAS TRUNCATED BEFORE LLM INFERENCE.
            </span>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={`${selectedNode ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-200 h-[530px]`}>
            <MindmapCanvas
              mindmap={currentMindmap}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </div>

          {selectedNode && (
            <div className="lg:col-span-1">
              <SummaryPanel
                node={selectedNode}
                mindmap={currentMindmap}
                onClose={() => setSelectedNode(null)}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Brutalist Footer */}
      <footer className="border-t-2 border-border bg-surface px-6 py-3 font-mono text-xs text-ink/70 flex items-center justify-between">
        <span className="font-bold uppercase">[ VISUALLI // NEO-BRUTALIST EDITION ]</span>
        <span className="font-bold uppercase text-accent">[ REACT FLOW + DAGRE + LLM REPAIR ]</span>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
