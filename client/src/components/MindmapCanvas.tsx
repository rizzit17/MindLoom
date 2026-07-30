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
      <div className="w-full h-full min-h-[450px] bg-bg border-2 border-dashed border-border p-8 text-center font-mono flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-surface border-2 border-border shadow-[4px_4px_0px_var(--border)] text-accent">
          <Network className="w-10 h-10 stroke-[2]" />
        </div>
        <div className="max-w-md flex flex-col gap-2">
          <h3 className="text-lg font-display font-black uppercase text-ink">
            [ NO_MINDMAP_GENERATED ]
          </h3>
          <p className="text-xs text-ink/80 leading-relaxed font-mono">
            Paste input document text above and press <span className="font-bold text-accent">[ GENERATE MINDMAP ]</span> to execute structured node extraction.
          </p>
        </div>
        <div className="text-[11px] font-bold text-ink bg-surface border border-border px-3 py-1 uppercase">
          STRICT SCHEMA // 5-9 NODES // STAMPED RELATIONSHIPS
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-surface border-2 border-border shadow-[4px_4px_0px_var(--border)] relative overflow-hidden font-mono">
      <div className="absolute top-4 left-4 z-10 bg-surface border-2 border-border px-3 py-1.5 shadow-[3px_3px_0px_var(--border)] flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-accent" />
        <div>
          <h3 className="text-xs font-display font-black uppercase tracking-wide text-ink">
            {mindmap.title}
          </h3>
          <p className="text-[10px] text-ink/70 uppercase">
            {mindmap.nodes.length} NODES • DAGRE HIERARCHICAL LAYOUT
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
        <Controls className="!bg-surface !border-2 !border-border !shadow-[3px_3px_0px_var(--border)] !rounded-none" />
        <Background variant={BackgroundVariant.Cross} gap={24} size={2} color="var(--border)" />
        <MiniMap
          nodeColor={(n) => (n.type === 'rootNode' ? '#FF4B1F' : 'var(--surface)')}
          maskColor="rgba(0, 0, 0, 0.4)"
          className="!bg-surface !border-2 !border-border !shadow-[4px_4px_0px_var(--border)] !rounded-none"
        />
      </ReactFlow>
    </div>
  );
};
