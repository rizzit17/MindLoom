import React from 'react';
import { X, Tag, ArrowUpRight } from 'lucide-react';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { motion, AnimatePresence } from 'framer-motion';

interface SummaryPanelProps {
  node: MindmapNode | null;
  mindmap: Mindmap | null;
  onClose: () => void;
  onSelectNode: (node: MindmapNode) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  node,
  mindmap,
  onClose,
  onSelectNode,
}) => {
  if (!node || !mindmap) return null;

  const isRoot = node.id === mindmap.rootId || node.isRoot === true;

  // Find connected node relationships
  const connectedConnections = mindmap.connections.filter(
    (c) => c.from === node.id || c.to === node.id
  );

  const connectedNodes = connectedConnections
    .map((conn) => {
      const targetId = conn.from === node.id ? conn.to : conn.from;
      const targetNode = mindmap.nodes.find((n) => n.id === targetId);
      return {
        node: targetNode,
        label: conn.label,
        direction: conn.from === node.id ? 'OUTGOING' : 'INCOMING',
      };
    })
    .filter((item): item is { node: MindmapNode; label: string | undefined; direction: string } => Boolean(item.node));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.15 }}
        className="bg-surface border-2 border-border shadow-[6px_6px_0px_var(--border)] font-mono p-5 flex flex-col gap-4 w-full max-w-sm"
        style={{ borderRadius: '0px' }}
      >
        <div className="flex items-start justify-between gap-3 border-b-2 border-border pb-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-ink font-mono">NODE_ID: {node.id}</span>
              {isRoot && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-accent border border-border px-2 py-0.5 font-mono">
                  [ROOT TOPIC]
                </span>
              )}
            </div>
            <h3 className="text-base font-display font-black text-ink uppercase leading-snug">
              {node.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="brutal-btn p-1 text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="border-2 border-border bg-bg p-3.5 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink/70">
            // SUMMARY_DETAILS (1-SENTENCE CONSTRAINT)
          </span>
          <p className="text-xs text-ink leading-relaxed font-mono font-medium">{node.summary}</p>
        </div>

        {connectedNodes.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              CONNECTED_RELATIONSHIPS ({connectedNodes.length})
            </span>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {connectedNodes.map(({ node: relNode, label, direction }, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectNode(relNode)}
                  className="brutal-btn p-2.5 text-left flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-ink group-hover:text-accent transition-colors">
                      {relNode.label}
                    </span>
                    {label && (
                      <span className="text-[10px] font-mono text-ink/70 uppercase">
                        TAG: [{label.toUpperCase()}]
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-ink group-hover:text-accent">
                    <span className="text-[9px] uppercase font-mono font-bold bg-bg border border-border px-1">
                      {direction}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
