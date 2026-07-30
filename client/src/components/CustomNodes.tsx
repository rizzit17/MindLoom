import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { MindmapNode } from '@visualli/shared';

export interface MindmapNodeData extends MindmapNode {
  isSelected?: boolean;
  onNodeClick?: (node: MindmapNode) => void;
}

export const CustomRootNode = memo(({ data }: NodeProps<{ data: MindmapNodeData }>) => {
  const isSelected = data.isSelected;

  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className={`px-6 py-4 rounded-2xl shadow-2xl transition-all cursor-pointer select-none text-white border ${
        isSelected
          ? 'ring-4 ring-blue-400 border-blue-300 scale-105 shadow-blue-500/40'
          : 'border-blue-400/40 hover:border-blue-300 hover:scale-102'
      }`}
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-300 border-2 border-blue-900" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-300 border-2 border-blue-900" />

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full">
          Central Topic
        </span>
      </div>
      <h3 className="text-base font-bold tracking-tight leading-snug">{data.label}</h3>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-300 border-2 border-blue-900" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-300 border-2 border-blue-900" />
    </div>
  );
});

CustomRootNode.displayName = 'CustomRootNode';

export const CustomChildNode = memo(({ data }: NodeProps<{ data: MindmapNodeData }>) => {
  const isSelected = data.isSelected;

  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className={`px-4 py-3 rounded-xl shadow-lg transition-all cursor-pointer select-none glass-panel border max-w-xs ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-400 scale-105 bg-slate-800'
          : 'border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900" />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900" />

      <h4 className="text-sm font-semibold text-slate-100 leading-snug">{data.label}</h4>

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-slate-400 border-2 border-slate-900" />
    </div>
  );
});

CustomChildNode.displayName = 'CustomChildNode';
