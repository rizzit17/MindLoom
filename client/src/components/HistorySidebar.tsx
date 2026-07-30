import React from 'react';
import { History, ChevronLeft, ChevronRight, Clock, Network } from 'lucide-react';
import { MindmapSummaryItem } from '@visualli/shared';

interface HistorySidebarProps {
  history: MindmapSummaryItem[];
  selectedId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectMindmap: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  selectedId,
  isOpen,
  onToggle,
  onSelectMindmap,
}) => {
  return (
    <div
      className={`fixed top-20 left-0 z-40 transition-all duration-300 flex ${
        isOpen ? 'translate-x-0' : '-translate-x-[320px]'
      }`}
    >
      <div className="w-80 glass-panel rounded-r-2xl border-l-0 border-slate-700/60 p-5 shadow-2xl flex flex-col gap-4 max-h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">Generation History</h3>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {history.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 opacity-40" />
              <p className="text-xs">No saved mindmaps yet.</p>
            </div>
          ) : (
            history.map((item) => {
              const isSelected = item.id === selectedId;
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectMindmap(item.id)}
                  className={`w-full p-3 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold line-clamp-1 leading-tight">{item.title}</span>
                    <Network className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        className="self-start mt-4 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-r-xl border border-l-0 border-slate-700 shadow-xl transition-all hover:bg-slate-700"
        title={isOpen ? 'Collapse History' : 'Expand History'}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </div>
  );
};
