import React from 'react';
import { X, Sparkles, ArrowRight, Tag } from 'lucide-react';
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
        direction: conn.from === node.id ? 'outgoing' : 'incoming',
      };
    })
    .filter((item): item is { node: MindmapNode; label: string | undefined; direction: string } => Boolean(item.node));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 flex flex-col gap-5 w-full max-w-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono text-slate-400">Node ID: {node.id}</span>
              {isRoot && (
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-300" /> Root Topic
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-100 leading-snug">{node.label}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Summary Details
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">{node.summary}</p>
        </div>

        {connectedNodes.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Connected Nodes ({connectedNodes.length})
            </span>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {connectedNodes.map(({ node: relNode, label, direction }, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectNode(relNode)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                      {relNode.label}
                    </span>
                    {label && <span className="text-[10px] text-slate-400">{label}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-400">
                    <span className="text-[10px] uppercase font-mono">{direction}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
