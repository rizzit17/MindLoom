import dagre from 'dagre';
import { Edge } from '@xyflow/react';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { MindmapCustomNode } from '../components/CustomNodes';

export function getLayoutedElements(
  mindmap: Mindmap,
  selectedNodeId?: string | null,
  onNodeClick?: (node: MindmapNode) => void,
  direction: 'LR' | 'TB' = 'LR'
): { nodes: MindmapCustomNode[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Default to Left-to-Right layout for clean visual Mindmap horizontal branching
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: direction === 'LR' ? 140 : 100,
    nodesep: direction === 'LR' ? 45 : 70,
  });

  const nodeWidth = 240;
  const nodeHeight = 85;

  // Add nodes to Dagre
  mindmap.nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to Dagre
  mindmap.connections.forEach((conn) => {
    dagreGraph.setEdge(conn.from, conn.to);
  });

  // Compute layout
  dagre.layout(dagreGraph);

  // Convert to React Flow Nodes
  const nodes: MindmapCustomNode[] = mindmap.nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id);
    const isRoot = node.id === mindmap.rootId || node.isRoot === true;

    return {
      id: node.id,
      type: isRoot ? 'rootNode' : 'childNode',
      position: {
        x: nodeWithPos.x - nodeWidth / 2,
        y: nodeWithPos.y - nodeHeight / 2,
      },
      data: {
        ...node,
        isSelected: node.id === selectedNodeId,
        onNodeClick,
      },
    };
  });

  // Convert to React Flow Edges with Softened Stamped Tags
  const edges: Edge[] = mindmap.connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
    target: conn.to,
    label: conn.label ? `[ ${conn.label} ]` : undefined,
    animated: false,
    style: { stroke: '#5B7FE0', strokeWidth: 2.5 },
    labelStyle: {
      fill: 'var(--ink)',
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'JetBrains Mono, monospace',
    },
    labelBgStyle: {
      fill: 'var(--surface)',
      stroke: 'var(--border)',
      strokeWidth: 1.5,
      rx: 3,
      ry: 3,
    },
    labelBgPadding: [6, 4],
  }));

  return { nodes, edges };
}
