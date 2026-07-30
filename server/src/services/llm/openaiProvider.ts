import OpenAI from 'openai';
import { LlmClient, RepairContext } from './llmClient';
import { SYSTEM_PROMPT, createDeveloperPrompt, createRepairPrompt } from './prompts';
import { BadGatewayError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

const MINDMAP_JSON_SCHEMA = {
  name: 'mindmap_output',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Overall mindmap title' },
      rootId: { type: 'string', description: 'ID of the root node' },
      nodes: {
        type: 'array',
        description: 'List of mindmap nodes (must contain 5 to 9 nodes total)',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique node identifier' },
            label: { type: 'string', description: 'Concise label (1-4 words)' },
            summary: { type: 'string', description: 'One-sentence summary' },
            isRoot: { type: 'boolean', description: 'True if root node' },
          },
          required: ['id', 'label', 'summary'],
          additionalProperties: false,
        },
      },
      connections: {
        type: 'array',
        description: 'Connections between nodes',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique connection identifier' },
            from: { type: 'string', description: 'Source node ID' },
            to: { type: 'string', description: 'Target node ID' },
            label: { type: 'string', description: 'Relationship label' },
          },
          required: ['id', 'from', 'to'],
          additionalProperties: false,
        },
      },
    },
    required: ['title', 'rootId', 'nodes', 'connections'],
    additionalProperties: false,
  },
};

export class OpenAiProvider implements LlmClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateMindmap(text: string, repairContext?: RepairContext): Promise<string> {
    try {
      const userContent = repairContext
        ? createRepairPrompt(text, repairContext.previousOutput, repairContext.errors)
        : createDeveloperPrompt(text);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: MINDMAP_JSON_SCHEMA,
        },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new BadGatewayError('OpenAI returned empty response content');
      }

      return content;
    } catch (error) {
      if (error instanceof BadGatewayError) throw error;
      logger.error('OpenAI API call failed', error);
      throw new BadGatewayError('Failed to generate mindmap from LLM provider', [
        error instanceof Error ? error.message : String(error),
      ]);
    }
  }
}
