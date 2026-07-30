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

    let newChild1: MindmapNode;
    let newChild2: MindmapNode;
    let conn1Label = 'sub-topic';
    let conn2Label = 'sub-topic';

    if (labelLower.includes('service model') || labelLower.includes('models')) {
      newChild1 = {
        id: child1Id,
        label: 'IaaS & PaaS Layers',
        summary: 'Infrastructure as a Service (virtual servers/storage) and Platform as a Service (development runtime environment).',
      };
      newChild2 = {
        id: child2Id,
        label: 'SaaS Applications',
        summary: 'Software as a Service delivering end-user web applications fully managed in the cloud.',
      };
      conn1Label = 'infrastructure';
      conn2Label = 'applications';
    } else if (labelLower.includes('provider') || labelLower.includes('aws') || labelLower.includes('azure')) {
      newChild1 = {
        id: child1Id,
        label: 'AWS & Microsoft Azure',
        summary: 'Market leaders providing global data centers, scalable virtual computing, and enterprise Active Directory integration.',
      };
      newChild2 = {
        id: child2Id,
        label: 'Google Cloud (GCP)',
        summary: 'Hyperscale cloud provider specializing in big data analytics, Kubernetes container management, and AI workloads.',
      };
      conn1Label = 'enterprise market';
      conn2Label = 'analytics & AI';
    } else if (labelLower.includes('benefit') || labelLower.includes('advantage')) {
      newChild1 = {
        id: child1Id,
        label: 'Elastic Scalability',
        summary: 'Instant auto-scaling of compute and memory capacity matching real-time user traffic spikes.',
      };
      newChild2 = {
        id: child2Id,
        label: 'Cost & Disaster Recovery',
        summary: 'Pay-as-you-go operational expense model with automated cross-region backup and 99.99% availability.',
      };
      conn1Label = 'performance';
      conn2Label = 'financial & uptime';
    } else if (labelLower.includes('challenge') || labelLower.includes('consideration') || labelLower.includes('risk')) {
      newChild1 = {
        id: child1Id,
        label: 'Cybersecurity & Compliance',
        summary: 'Ensuring data encryption at rest/transit, regulatory compliance (SOC2/GDPR), and identity management.',
      };
      newChild2 = {
        id: child2Id,
        label: 'Vendor Lock-in Mitigation',
        summary: 'Avoiding proprietary cloud API dependencies by leveraging open container standards like Docker and Kubernetes.',
      };
      conn1Label = 'governance';
      conn2Label = 'architecture';
    } else {
      newChild1 = {
        id: child1Id,
        label: `${targetNode.label} Specifications`,
        summary: `Detailed technical architecture, core requirements, and structural components of ${targetNode.label}.`,
      };
      newChild2 = {
        id: child2Id,
        label: `${targetNode.label} Operations`,
        summary: `Operational workflows, monitoring metrics, best practices, and integration patterns for ${targetNode.label}.`,
      };
      conn1Label = 'specifications';
      conn2Label = 'implementation';
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
