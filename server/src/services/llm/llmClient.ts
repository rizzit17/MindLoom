import { getEnvConfig } from '../../config/env';
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
  const envConfig = getEnvConfig();
  const isMock = overrideMock !== undefined ? overrideMock : envConfig.MOCK_MODE;

  if (!isMock && envConfig.GROQ_API_KEY) {
    logger.info(`Using Groq LLM Provider (${envConfig.LLM_MODEL || 'llama-3.3-70b-versatile'})`);
    return new OpenAiProvider(
      envConfig.GROQ_API_KEY,
      'https://api.groq.com/openai/v1',
      envConfig.LLM_MODEL || 'llama-3.3-70b-versatile'
    );
  }

  if (!isMock && envConfig.OPENAI_API_KEY) {
    logger.info(`Using OpenAI LLM Provider (${envConfig.LLM_MODEL || 'gpt-4o-mini'})`);
    return new OpenAiProvider(
      envConfig.OPENAI_API_KEY,
      envConfig.OPENAI_BASE_URL,
      envConfig.LLM_MODEL || 'gpt-4o-mini'
    );
  }

  logger.info('Using Mock LLM Provider');
  return new MockProvider();
}
