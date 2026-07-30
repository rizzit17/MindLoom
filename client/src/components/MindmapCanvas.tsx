import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
} from '@xyflow/react';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { CustomRootNode, CustomChildNode } from './CustomNodes';
import { getLayoutedElements } from '../utils/layout';
import { Network, Sparkles } from 'lucide-react';

interface MindmapCanvasProps {
  mindmap: Mindmap | null;
  selectedNodeId: string | null;
  onSelectNode: (node: MindmapNode) => void;
}

export const MindmapCanvas: React.FC<MindmapCanvasProps> = ({
  mindmap,
  selectedNodeId,
  onSelectNode,
}) => {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      rootNode: CustomRootNode,
      childNode: CustomChildNode,
    }),
    []
  );

  const { nodes, edges } = useMemo(() => {
    if (!mindmap) return { nodes: [], edges: [] };
    return getLayoutedElements(mindmap, selectedNodeId, onSelectNode);
  }, [mindmap, selectedNodeId, onSelectNode]);

  if (!mindmap) {
    return (
      <div className="w-full h-full min-h-[450px] glass-panel rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Network className="w-12 h-12 stroke-[1.5]" />
        </div>
        <div className="max-w-md flex flex-col gap-2">
          <h3 className="text-xl font-bold text-slate-100">No Mindmap Generated Yet</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Paste your input text into the panel above and click <span className="text-blue-400 font-semibold">Generate Mindmap</span> to construct an interactive node-link diagram.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Supports automatic layout, node selection, and summary drawer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden glass-panel border border-slate-700/50 relative shadow-2xl">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/60 px-4 py-2 rounded-xl flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <h3 className="text-sm font-bold text-slate-100 leading-tight">{mindmap.title}</h3>
          <p className="text-[11px] text-slate-400">{mindmap.nodes.length} Nodes • Interactive Flow</p>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="!bg-slate-900/80 !border-slate-700 !text-slate-200 !rounded-xl overflow-hidden" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <MiniMap
          nodeColor={(n) => (n.type === 'rootNode' ? '#3b82f6' : '#1e293b')}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900/90 !border-slate-700 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
};
