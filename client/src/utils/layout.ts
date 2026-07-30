import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { Mindmap, MindmapNode } from '@visualli/shared';
import { MindmapNodeData } from '../components/CustomNodes';

export function getLayoutedElements(
  mindmap: Mindmap,
  selectedNodeId?: string | null,
  onNodeClick?: (node: MindmapNode) => void
): { nodes: Node<MindmapNodeData>[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Direction: TB (Top-to-Bottom) or LR (Left-to-Right)
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 });

  const nodeWidth = 220;
  const nodeHeight = 90;

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
  const nodes: Node<MindmapNodeData>[] = mindmap.nodes.map((node) => {
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

  // Convert to React Flow Edges
  const edges: Edge[] = mindmap.connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
    target: conn.to,
    label: conn.label,
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 500 },
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
  }));

  return { nodes, edges };
}
