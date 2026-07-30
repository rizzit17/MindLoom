import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import { MockProvider } from './mockProvider';
import { OpenAiProvider } from './openaiProvider';

export interface RepairContext {
  previousOutput: string;
  errors: string[];
}

export interface LlmClient {
  generateMindmap(text: string, repairContext?: RepairContext): Promise<string>;
}

export function createLlmClient(overrideMock?: boolean): LlmClient {
  const isMock = overrideMock !== undefined ? overrideMock : config.MOCK_MODE;

  if (!isMock && config.GROQ_API_KEY) {
    logger.info(`Using Groq LLM Provider (${config.LLM_MODEL || 'llama-3.3-70b-versatile'})`);
    return new OpenAiProvider(
      config.GROQ_API_KEY,
      'https://api.groq.com/openai/v1',
      config.LLM_MODEL || 'llama-3.3-70b-versatile'
    );
  }

  if (!isMock && config.OPENAI_API_KEY) {
    logger.info(`Using OpenAI LLM Provider (${config.LLM_MODEL || 'gpt-4o-mini'})`);
    return new OpenAiProvider(
      config.OPENAI_API_KEY,
      config.OPENAI_BASE_URL,
      config.LLM_MODEL || 'gpt-4o-mini'
    );
  }

  logger.info('Using Mock LLM Provider');
  return new MockProvider();
}
