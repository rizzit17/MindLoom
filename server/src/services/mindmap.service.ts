import { Mindmap } from '@visualli/shared';
import { LlmClient } from './llm/llmClient';
import { parseAndValidateMindmapOutput } from '../validators/mindmapValidator';
import { truncateInput } from '../utils/tokenEstimate';
import { UnprocessableEntityError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class MindmapService {
  constructor(private llmClient: LlmClient) {}

  async generateAndValidateMindmap(inputText: string): Promise<Mindmap> {
    // 1. Truncate input if it exceeds character budget
    const { text: processedText, truncated } = truncateInput(inputText, 12000);

    if (truncated) {
      logger.warn('Input text exceeded 12,000 character limit and was truncated.');
    }

    // 2. Initial LLM Call
    logger.info('Calling LLM to generate initial mindmap...');
    const rawOutput = await this.llmClient.generateMindmap(processedText);

    // 3. First-pass Validation (Zod + Domain rules)
    const initialValidation = parseAndValidateMindmapOutput(rawOutput);

    if (initialValidation.isValid && initialValidation.mindmap) {
      logger.info('Mindmap generated successfully on first attempt.');
      return {
        ...initialValidation.mindmap,
        truncated,
      };
    }

    // 4. Trigger Exactly One Repair Attempt
    logger.warn('Initial mindmap generation failed validation. Triggering repair retry...', {
      errors: initialValidation.errors,
    });

    const repairedOutput = await this.llmClient.generateMindmap(processedText, {
      previousOutput: rawOutput,
      errors: initialValidation.errors,
    });

    // 5. Second-pass Validation
    const repairValidation = parseAndValidateMindmapOutput(repairedOutput);

    if (repairValidation.isValid && repairValidation.mindmap) {
      logger.info('Mindmap repaired successfully on second attempt.');
      return {
        ...repairValidation.mindmap,
        truncated,
      };
    }

    // 6. Fail Loudly with Detailed Typed Error
    logger.error('Mindmap repair attempt failed validation.', undefined, {
      errors: repairValidation.errors,
      truncated,
    });

    if (truncated) {
      throw new UnprocessableEntityError(
        'Mindmap generation failed validation even after repair attempt. Note: input text was truncated at 12,000 characters and may have lost sufficient context.',
        repairValidation.errors
      );
    }

    throw new UnprocessableEntityError(
      'Mindmap generation failed strict domain validation after repair retry.',
      repairValidation.errors
    );
  }
}
