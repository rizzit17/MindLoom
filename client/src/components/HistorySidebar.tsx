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
      className={`fixed top-20 left-0 z-40 transition-transform duration-200 flex ${
        isOpen ? 'translate-x-0' : '-translate-x-[320px]'
      }`}
    >
      <div className="w-80 bg-surface border-2 border-border border-l-0 p-5 shadow-[6px_6px_0px_var(--border)] font-mono flex flex-col gap-4 max-h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-display font-black uppercase text-ink">GENERATION_HISTORY</h3>
          </div>
          <span className="text-xs font-bold text-ink bg-bg border border-border px-2 py-0.5">
            [{history.length}]
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-8 text-ink/60 flex flex-col items-center gap-2 font-mono">
              <Clock className="w-8 h-8 opacity-50" />
              <p className="text-xs font-bold">[ NO SAVED MINDMAPS ]</p>
            </div>
          ) : (
            history.map((item) => {
              const isSelected = item.id === selectedId;
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'JUST NOW';

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectMindmap(item.id)}
                  className={`w-full p-3 border-2 border-border text-left font-mono transition-transform flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-accent-secondary text-white shadow-[3px_3px_0px_var(--border)] font-bold'
                      : 'bg-surface text-ink shadow-[2px_2px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold line-clamp-1 leading-tight uppercase">
                      {item.title}
                    </span>
                    <Network className="w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                  <span className="text-[10px] flex items-center gap-1 font-bold">
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
        className="self-start mt-4 brutal-btn p-2 border-l-0 text-ink"
        title={isOpen ? 'Collapse History' : 'Expand History'}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </div>
  );
};
