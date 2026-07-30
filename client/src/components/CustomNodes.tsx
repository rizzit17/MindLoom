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
      className={`px-5 py-3.5 border-3 cursor-pointer select-none text-white transition-transform ${
        isSelected
          ? 'bg-accent border-border shadow-[6px_6px_0px_var(--border)] translate-x-[-1px] translate-y-[-1px]'
          : 'bg-accent border-border shadow-[4px_4px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
      style={{
        borderRadius: '0px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-surface !border-2 !border-border !rounded-none"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-surface !border-2 !border-border !rounded-none"
      />

      <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px] font-bold tracking-wider uppercase text-white/90">
        <span className="bg-black text-white px-1.5 py-0.5 border border-white/40">[ROOT_TOPIC]</span>
      </div>
      <h3 className="text-base font-display font-black tracking-tight leading-tight uppercase text-white">
        {data.label}
      </h3>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-surface !border-2 !border-border !rounded-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-surface !border-2 !border-border !rounded-none"
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
      className={`px-4 py-2.5 border-2 cursor-pointer select-none bg-surface text-ink transition-transform max-w-xs ${
        isSelected
          ? 'border-accent-secondary shadow-[5px_5px_0px_var(--border)] translate-x-[-1px] translate-y-[-1px]'
          : 'border-border shadow-[3px_3px_0px_var(--border)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
      style={{
        borderRadius: '0px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-ink !border !border-border !rounded-none"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-ink !border !border-border !rounded-none"
      />

      <h4 className="text-sm font-mono font-bold text-ink leading-snug">{data.label}</h4>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-ink !border !border-border !rounded-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-ink !border !border-border !rounded-none"
      />
    </div>
  );
});

CustomChildNode.displayName = 'CustomChildNode';
