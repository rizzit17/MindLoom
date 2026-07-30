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
import { Network } from 'lucide-react';

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
      <div className="w-full h-full min-h-[450px] bg-bg border-[1.5px] border-dashed border-border p-8 text-center font-mono rounded-[4px] flex flex-col items-center justify-center gap-4">
        <div className="p-3 bg-surface border-[1.5px] border-border shadow-[2px_2px_0px_var(--border)] rounded-[4px] text-accent">
          <Network className="w-8 h-8 stroke-[2]" />
        </div>
        <div className="max-w-md flex flex-col gap-1.5">
          <h3 className="text-base font-display font-bold text-ink">
            No Mindmap Generated
          </h3>
          <p className="text-xs text-ink/70 leading-relaxed font-mono">
            Paste source text above and click <span className="font-semibold text-accent font-display">Generate Mindmap</span> to extract structured entities.
          </p>
        </div>
        <div className="text-[11px] text-ink/80 bg-surface border border-border px-3 py-1 rounded-[3px]">
          Structured Zod Schema • 5–9 Nodes • Dagre Layout
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-surface border-[1.5px] border-border shadow-[3px_3px_0px_var(--border)] rounded-[4px] relative overflow-hidden font-mono">
      <div className="absolute top-4 left-4 z-10 bg-surface border-[1.5px] border-border px-3 py-1.5 shadow-[2px_2px_0px_var(--border)] rounded-[4px] flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-accent rounded-full" />
        <div>
          <h3 className="text-xs font-display font-bold text-ink tracking-tight">
            {mindmap.title}
          </h3>
          <p className="text-[10px] text-ink/60 font-mono">
            {mindmap.nodes.length} nodes • Auto Layout
          </p>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="!bg-surface !border-[1.5px] !border-border !shadow-[2px_2px_0px_var(--border)] !rounded-[4px]" />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--border)" />
        <MiniMap
          nodeColor={(n) => (n.type === 'rootNode' ? '#E8734A' : 'var(--surface)')}
          maskColor="rgba(0, 0, 0, 0.3)"
          className="!bg-surface !border-[1.5px] !border-border !shadow-[3px_3px_0px_var(--border)] !rounded-[4px]"
        />
      </ReactFlow>
    </div>
  );
};
