import { Mindmap, MindmapNode, MindmapConnection } from '@visualli/shared';
import { LlmClient } from './llm/llmClient';
import { parseAndValidateMindmapOutput } from '../validators/mindmapValidator';
import { truncateInput } from '../utils/tokenEstimate';
import { UnprocessableEntityError, NotFoundError } from '../middleware/errorHandler';
import { MindmapRepository } from '../repositories/mindmap.repository';
import { logger } from '../utils/logger';

export class MindmapService {
  constructor(
    private llmClient: LlmClient,
    private repository: MindmapRepository = new MindmapRepository()
  ) {}

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

  async expandNode(mindmapId: string, nodeId: string): Promise<Mindmap> {
    const mindmap = this.repository.findById(mindmapId);
    if (!mindmap) {
      throw new NotFoundError(`Mindmap with ID '${mindmapId}' was not found.`);
    }

    const targetNode = mindmap.nodes.find((n) => n.id === nodeId);
    if (!targetNode) {
      throw new NotFoundError(`Node with ID '${nodeId}' was not found in mindmap.`);
    }

    logger.info(`Expanding child layer for node '${targetNode.label}' (${nodeId})...`);

    const timestamp = Date.now().toString().slice(-4);
    const child1Id = `${nodeId}_sub1_${timestamp}`;
    const child2Id = `${nodeId}_sub2_${timestamp}`;

    const newChild1: MindmapNode = {
      id: child1Id,
      label: `${targetNode.label} Deep-Dive`,
      summary: `Detailed architectural breakdown and component specs for ${targetNode.label}.`,
    };

    const newChild2: MindmapNode = {
      id: child2Id,
      label: `${targetNode.label} Operations`,
      summary: `Best practices, monitoring metrics, and implementation patterns for ${targetNode.label}.`,
    };

    const conn1: MindmapConnection = {
      id: `c_${child1Id}`,
      from: nodeId,
      to: child1Id,
      label: 'deep-dive',
    };

    const conn2: MindmapConnection = {
      id: `c_${child2Id}`,
      from: nodeId,
      to: child2Id,
      label: 'operations',
    };

    const updatedMindmap: Mindmap = {
      ...mindmap,
      nodes: [...mindmap.nodes, newChild1, newChild2],
      connections: [...mindmap.connections, conn1, conn2],
    };

    return this.repository.update(mindmapId, updatedMindmap);
  }
}
