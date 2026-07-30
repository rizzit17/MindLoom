import OpenAI from 'openai';
import { LlmClient, RepairContext } from './llmClient';
import { SYSTEM_PROMPT, createDeveloperPrompt, createRepairPrompt } from './prompts';
import { BadGatewayError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export class OpenAiProvider implements LlmClient {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL?: string, model?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
    this.model = model || 'gpt-4o-mini';
  }

  async generateMindmap(text: string, repairContext?: RepairContext): Promise<string> {
    try {
      const userContent = repairContext
        ? createRepairPrompt(text, repairContext.previousOutput, repairContext.errors)
        : createDeveloperPrompt(text);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: {
          type: 'json_object',
        },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new BadGatewayError('LLM Provider returned empty response content');
      }

      return content;
    } catch (error) {
      if (error instanceof BadGatewayError) throw error;
      logger.error('LLM API call failed', error);
      throw new BadGatewayError('Failed to generate mindmap from LLM provider', [
        error instanceof Error ? error.message : String(error),
      ]);
    }
  }
}
