import axios from 'axios';
import { Mindmap, MindmapSummaryItem } from '@visualli/shared';

// Runtime environment check: if running on non-localhost (e.g. Render production), use relative path
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (!isLocalhost ? '' : 'http://localhost:3001');

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for cloud LLM generation
});

export interface ApiErrorResponse {
  error: string;
  details?: string[];
}

export const mindmapApi = {
  generateMindmap: async (text: string): Promise<Mindmap> => {
    const response = await apiClient.post<Mindmap>('/mindmaps', { text });
    return response.data;
  },

  getMindmaps: async (): Promise<MindmapSummaryItem[]> => {
    const response = await apiClient.get<MindmapSummaryItem[]>('/mindmaps');
    return response.data;
  },

  getMindmapById: async (id: string): Promise<Mindmap> => {
    const response = await apiClient.get<Mindmap>(`/mindmaps/${id}`);
    return response.data;
  },

  expandNode: async (mindmapId: string, nodeId: string): Promise<Mindmap> => {
    const response = await apiClient.post<Mindmap>(`/mindmaps/${mindmapId}/expand`, { nodeId });
    return response.data;
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/mindmaps');
  },
};
