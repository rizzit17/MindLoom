export interface MindmapNode {
  id: string;
  label: string;
  summary: string;
  isRoot?: boolean;
}

export interface MindmapConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface Mindmap {
  id?: string;
  title: string;
  rootId: string;
  nodes: MindmapNode[];
  connections: MindmapConnection[];
  createdAt?: string;
  truncated?: boolean;
}

export interface MindmapSummaryItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface CreateMindmapRequest {
  text: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string[];
}
