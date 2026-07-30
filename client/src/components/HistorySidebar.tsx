import React from 'react';
import { History, ChevronLeft, ChevronRight, Clock, Network, X } from 'lucide-react';
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
    <>
      {/* Backdrop overlay when history drawer is expanded */}
      <div
        onClick={onToggle}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 transition-transform duration-200 flex ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-80 bg-surface border-r-[1.5px] border-border p-5 shadow-[6px_0px_0px_var(--border)] font-mono flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-display font-bold text-ink">Generation History</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink bg-bg border border-border px-2 py-0.5 rounded-[3px]">
                {history.length}
              </span>
              <button
                onClick={onToggle}
                className="studio-btn p-1 text-ink"
                title="Close History"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-ink/60 flex flex-col items-center gap-2 font-mono">
                <Clock className="w-6 h-6 opacity-40" />
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
                    onClick={() => {
                      onSelectMindmap(item.id);
                      onToggle(); // Close sidebar on selection
                    }}
                    className={`w-full p-3 border-[1.5px] border-border text-left font-mono transition-all rounded-[4px] flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-accent-secondary text-white shadow-[2px_2px_0px_var(--border)] font-bold'
                        : 'bg-surface text-ink shadow-[2px_2px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0.5 active:translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium line-clamp-1 leading-tight">
                        {item.title}
                      </span>
                      <Network className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] flex items-center gap-1 opacity-80">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Floating expand tab when collapsed */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="absolute left-full top-20 mt-4 studio-btn p-2 rounded-r-[4px] border-l-0 text-ink shadow-[3px_3px_0px_var(--border)]"
            title="Expand History"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
};
