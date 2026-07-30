import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { mindmapApi } from './services/api';
import { InputPanel } from './components/InputPanel';
import { MindmapCanvas } from './components/MindmapCanvas';
import { SummaryPanel } from './components/SummaryPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { Toast, ToastMessage } from './components/Toast';
import { Sun, Moon, BrainCircuit, AlertTriangle, Sparkles, History } from 'lucide-react';
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

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: mindmapApi.clearHistory,
    onSuccess: () => {
      setCurrentMindmap(null);
      setSelectedNode(null);
      refetchHistory();
      setToast({
        id: Date.now().toString(),
        type: 'info',
        title: 'History Cleared',
        message: 'All saved mindmaps have been wiped from generation history.',
      });
    },
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
          message: 'Unable to reach backend API. Please verify network connection or server status.',
        });
      }
    },
  });

  // Expand node drill-down mutation
  const expandMutation = useMutation({
    mutationFn: ({ mindmapId, nodeId }: { mindmapId: string; nodeId: string }) =>
      mindmapApi.expandNode(mindmapId, nodeId),
    onSuccess: (updatedMindmap) => {
      setCurrentMindmap(updatedMindmap);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        title: 'Node Layer Expanded',
        message: 'Successfully generated child deep-dive sub-nodes for selected topic.',
      });
    },
    onError: () => {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Expansion Failed',
        message: 'Could not expand child layer for selected node.',
      });
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
    <div className="min-h-screen h-screen bg-bg text-ink flex flex-col font-mono selection:bg-accent selection:text-white overflow-hidden">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Main Studio Header */}
      <header className="sticky top-0 z-30 bg-surface border-b-[1.5px] border-border px-6 py-3.5 flex items-center justify-between shadow-[0_2px_0_var(--border)] flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            className={`studio-btn px-3 py-1.5 text-xs font-mono flex items-center gap-2 ${
              isHistoryOpen ? 'bg-accent text-white border-border shadow-[2px_2px_0px_var(--border)]' : ''
            }`}
            title="Toggle Generation History Sidebar"
          >
            <History className={`w-4 h-4 ${isHistoryOpen ? 'text-white' : 'text-accent'}`} />
            <span>History ({history.length})</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent border-[1.5px] border-border text-white rounded-[4px] shadow-[2px_2px_0px_var(--border)]">
              <BrainCircuit className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base font-display font-black tracking-tight text-ink flex items-center gap-2 leading-none">
                Visualli <span className="bg-bg border border-border text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] text-accent font-semibold">[mini mindmap]</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-medium text-ink bg-bg border-[1.5px] border-border px-3 py-1 rounded-[4px] shadow-[2px_2px_0px_var(--border)]">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Strict Zod + Domain Repair</span>
          </div>

          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="studio-btn p-2 text-ink flex items-center justify-center"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-accent-secondary" />}
          </button>
        </div>
      </header>

      {/* Main Split Layout Workspace */}
      <div className="flex-1 flex w-full overflow-hidden">
        <HistorySidebar
          history={history}
          selectedId={currentMindmap?.id || null}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(false)}
          onSelectMindmap={handleSelectHistoryItem}
          onClearHistory={() => clearHistoryMutation.mutate()}
        />

        {/* Workspace Container (Shifts Right smoothly when Sidebar Opens) */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 overflow-y-auto">
          <InputPanel
            onGenerate={(text) => generateMutation.mutate(text)}
            isLoading={generateMutation.isPending}
          />

          {currentMindmap?.truncated && (
            <div className="p-3 bg-amber-500/15 border-[1.5px] border-amber-500/40 text-amber-800 dark:text-amber-200 rounded-[4px] font-mono text-xs font-medium shadow-[2px_2px_0px_var(--border)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                Input text exceeded 12,000 characters and was truncated prior to LLM inference.
              </span>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className={`${selectedNode ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-200 h-[520px]`}>
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
                  onExpandNode={(nodeId) => {
                    if (currentMindmap?.id) {
                      expandMutation.mutate({ mindmapId: currentMindmap.id, nodeId });
                    }
                  }}
                  isExpanding={expandMutation.isPending}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Studio Footer */}
      <footer className="border-t-[1.5px] border-border bg-surface px-6 py-2.5 font-mono text-xs text-ink/60 flex items-center justify-between flex-shrink-0">
        <span>Visualli.ai - Mini Mindmap Studio</span>
        <span className="text-accent font-medium font-display">React Flow • Dagre • Zod Repair Engine</span>
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
