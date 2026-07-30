import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { mindmapApi } from './services/api';
import { InputPanel } from './components/InputPanel';
import { MindmapCanvas } from './components/MindmapCanvas';
import { SummaryPanel } from './components/SummaryPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { Toast, ToastMessage } from './components/Toast';
import { Sun, Moon, Sparkles, BrainCircuit, AlertTriangle } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-text transition-colors duration-300 flex flex-col font-sans">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <HistorySidebar
        history={history}
        selectedId={currentMindmap?.id || null}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((prev) => !prev)}
        onSelectMindmap={handleSelectHistoryItem}
      />

      {/* Main Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              Visualli <span className="text-blue-400 font-normal text-sm bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Mini Mindmap</span>
            </h1>
            <p className="text-xs text-slate-400">Strict LLM-to-JSON Structuring Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Strict Zod + Domain Validation</span>
          </div>

          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
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
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Note: This mindmap was generated from truncated input text (budget limit: 12,000 characters).
            </span>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={`${selectedNode ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300 h-[520px]`}>
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
