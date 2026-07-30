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

    const targetNode = mindmap.nodes.find((n: MindmapNode) => n.id === nodeId);
    if (!targetNode) {
      throw new NotFoundError(`Node with ID '${nodeId}' was not found in mindmap.`);
    }

    logger.info(`Expanding child layer for node '${targetNode.label}' (${nodeId})...`);

    const timestamp = Date.now().toString().slice(-4);
    const child1Id = `${nodeId}_sub1_${timestamp}`;
    const child2Id = `${nodeId}_sub2_${timestamp}`;
    const labelLower = targetNode.label.toLowerCase();
    const summaryText = targetNode.summary || '';

    let newChild1: MindmapNode;
    let newChild2: MindmapNode;
    let conn1Label = 'sub-topic';
    let conn2Label = 'sub-topic';

    // Domain-aware sub-node generation based on node context
    if (labelLower.includes('risk') || labelLower.includes('assessment')) {
      newChild1 = {
        id: child1Id,
        label: `${targetNode.label} Analysis`,
        summary: `Evaluating impact severity, probability, and detectability parameters for ${targetNode.label}.`,
      };
      newChild2 = {
        id: child2Id,
        label: 'Mitigation & Control',
        summary: `Establishing corrective actions, preventive controls, and risk monitoring protocols.`,
      };
      conn1Label = 'evaluates';
      conn2Label = 'mitigates';
    } else if (labelLower.includes('complaint') || labelLower.includes('investigation')) {
      newChild1 = {
        id: child1Id,
        label: 'Root Cause Identification',
        summary: 'Investigating underlying failure modes and operational deviations causing complaints.',
      };
      newChild2 = {
        id: child2Id,
        label: 'Corrective Actions (CAPA)',
        summary: 'Implementing documented corrective measures and preventive workflows to eliminate recurrence.',
      };
      conn1Label = 'identifies';
      conn2Label = 'resolves';
    } else if (labelLower.includes('good manufacturing') || labelLower.includes('gmp') || labelLower.includes('procedure')) {
      newChild1 = {
        id: child1Id,
        label: 'Production & Quality Control',
        summary: 'Standardized operational procedures for consistent batch manufacturing and testing.',
      };
      newChild2 = {
        id: child2Id,
        label: 'Documentation & Audit Trails',
        summary: 'Maintaining immutable logs, batch records, and regulatory compliance evidence.',
      };
      conn1Label = 'standardizes';
      conn2Label = 'verifies';
    } else if (labelLower.includes('service model') || labelLower.includes('models')) {
      newChild1 = {
        id: child1Id,
        label: 'IaaS & PaaS Layers',
        summary: 'Infrastructure as a Service (virtual servers/storage) and Platform as a Service (runtime environment).',
      };
      newChild2 = {
        id: child2Id,
        label: 'SaaS Applications',
        summary: 'Software as a Service delivering end-user web applications fully managed in the cloud.',
      };
      conn1Label = 'infrastructure';
      conn2Label = 'applications';
    } else {
      // General dynamic extraction from summary or label
      const words = summaryText.split(/[\s,.;:]+/).filter((w) => w.length > 3);
      const keyTopic1 = words[0] ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} Details` : `${targetNode.label} Specs`;
      const keyTopic2 = words[3] ? `${words[3].charAt(0).toUpperCase() + words[3].slice(1)} Execution` : `${targetNode.label} Execution`;

      newChild1 = {
        id: child1Id,
        label: keyTopic1,
        summary: `Core breakdown and structural parameters for ${targetNode.label}.`,
      };
      newChild2 = {
        id: child2Id,
        label: keyTopic2,
        summary: `Implementation patterns, best practices, and operational workflows for ${targetNode.label}.`,
      };
      conn1Label = 'breakdown';
      conn2Label = 'execution';
    }

    const conn1: MindmapConnection = {
      id: `c_${child1Id}`,
      from: nodeId,
      to: child1Id,
      label: conn1Label,
    };

    const conn2: MindmapConnection = {
      id: `c_${child2Id}`,
      from: nodeId,
      to: child2Id,
      label: conn2Label,
    };

    const updatedMindmap: Mindmap = {
      ...mindmap,
      nodes: [...mindmap.nodes, newChild1, newChild2],
      connections: [...mindmap.connections, conn1, conn2],
    };

    return this.repository.update(mindmapId, updatedMindmap);
  }
}
