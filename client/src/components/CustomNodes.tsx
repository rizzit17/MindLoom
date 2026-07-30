import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { MindmapNode } from '@visualli/shared';

export type MindmapNodeData = MindmapNode & {
  isSelected?: boolean;
  onNodeClick?: (node: MindmapNode) => void;
} & Record<string, unknown>;

export type MindmapCustomNode = Node<MindmapNodeData>;

export const CustomRootNode = memo(({ data }: NodeProps<MindmapCustomNode>) => {
  const isSelected = data.isSelected;

  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className={`px-4 py-3 border-[1.5px] cursor-pointer select-none text-white transition-all rounded-[4px] ${
        isSelected
          ? 'bg-accent border-border shadow-[4px_4px_0px_var(--border)] translate-x-[-1px] translate-y-[-1px]'
          : 'bg-accent border-border shadow-[3px_3px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-surface !border !border-border !rounded-sm"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-surface !border !border-border !rounded-sm"
      />

      <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px] font-medium tracking-wide text-white/90">
        <span className="bg-black/20 text-white px-1.5 py-0.5 rounded-[3px]">Root Topic</span>
      </div>
      <h3 className="text-sm font-display font-bold tracking-tight leading-tight text-white">
        {data.label}
      </h3>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-surface !border !border-border !rounded-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-surface !border !border-border !rounded-sm"
      />
    </div>
  );
});

CustomRootNode.displayName = 'CustomRootNode';

export const CustomChildNode = memo(({ data }: NodeProps<MindmapCustomNode>) => {
  const isSelected = data.isSelected;

  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className={`px-3.5 py-2.5 border-[1.5px] cursor-pointer select-none bg-surface text-ink transition-all rounded-[4px] max-w-xs ${
        isSelected
          ? 'border-accent-secondary shadow-[4px_4px_0px_var(--border)] translate-x-[-1px] translate-y-[-1px]'
          : 'border-border shadow-[2px_2px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-ink !border !border-border !rounded-sm"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-ink !border !border-border !rounded-sm"
      />

      <h4 className="text-xs font-mono font-medium text-ink leading-snug">{data.label}</h4>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-ink !border !border-border !rounded-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-ink !border !border-border !rounded-sm"
      />
    </div>
  );
});

CustomChildNode.displayName = 'CustomChildNode';
