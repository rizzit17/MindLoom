import { z } from 'zod';

export const MindmapNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  label: z.string().min(1, 'Node label is required'),
  summary: z.string().min(1, 'Node summary is required'),
  isRoot: z.boolean().optional(),
});

export const MindmapConnectionSchema = z.object({
  id: z.string().min(1, 'Connection ID is required'),
  from: z.string().min(1, 'Connection from node ID is required'),
  to: z.string().min(1, 'Connection to node ID is required'),
  label: z.string().optional(),
});

export const MindmapSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Mindmap title is required'),
  rootId: z.string().min(1, 'Root ID is required'),
  nodes: z.array(MindmapNodeSchema),
  connections: z.array(MindmapConnectionSchema),
  createdAt: z.string().optional(),
  truncated: z.boolean().optional(),
});

export const CreateMindmapRequestSchema = z.object({
  text: z.string(),
});
