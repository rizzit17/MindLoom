import { config } from '../../config/env';
import { logger } from '../../utils/logger';

export interface RepairContext {
  previousOutput: string;
  errors: string[];
}

export interface LlmClient {
  generateMindmap(text: string, repairContext?: RepairContext): Promise<string>;
}

import { MockProvider } from './mockProvider';
import { OpenAiProvider } from './openaiProvider';

export function createLlmClient(overrideMock?: boolean): LlmClient {
  const isMock = overrideMock !== undefined ? overrideMock : config.MOCK_MODE;

  if (isMock || !config.OPENAI_API_KEY) {
    logger.info('Using Mock LLM Provider');
    return new MockProvider();
  }

  logger.info('Using OpenAI LLM Provider');
  return new OpenAiProvider(config.OPENAI_API_KEY);
}
