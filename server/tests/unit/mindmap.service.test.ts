import { MindmapService } from '../../src/services/mindmap.service';
import { LlmClient, RepairContext } from '../../src/services/llm/llmClient';
import { mockGeneralMindmap } from '../../src/fixtures/mockMindmaps';
import { UnprocessableEntityError } from '../../src/middleware/errorHandler';

describe('MindmapService Retry & Truncation Logic', () => {
  it('should return mindmap on first attempt if initial response is valid', async () => {
    const mockLlmClient: LlmClient = {
      generateMindmap: jest.fn().mockResolvedValue(JSON.stringify(mockGeneralMindmap)),
    };

    const service = new MindmapService(mockLlmClient);
    const result = await service.generateAndValidateMindmap('This is a test prompt with sufficient characters.');

    expect(result.title).toBe(mockGeneralMindmap.title);
    expect(result.truncated).toBe(false);
    expect(mockLlmClient.generateMindmap).toHaveBeenCalledTimes(1);
  });

  it('should trigger exactly ONE repair retry when initial response is invalid and repair succeeds', async () => {
    const invalidFirstResponse = JSON.stringify({
      title: 'Invalid Mindmap',
      rootId: 'root-id',
      nodes: [{ id: 'n1', label: 'Only 1 node', summary: 'Too few nodes' }],
      connections: [],
    });

    const validSecondResponse = JSON.stringify(mockGeneralMindmap);

    const mockLlmClient: LlmClient = {
      generateMindmap: jest
        .fn()
        .mockResolvedValueOnce(invalidFirstResponse)
        .mockResolvedValueOnce(validSecondResponse),
    };

    const service = new MindmapService(mockLlmClient);
    const result = await service.generateAndValidateMindmap('Sample text for mindmap generation testing.');

    expect(result.title).toBe(mockGeneralMindmap.title);
    expect(mockLlmClient.generateMindmap).toHaveBeenCalledTimes(2);

    // Verify repair context passed to second call
    const secondCallArgs = (mockLlmClient.generateMindmap as jest.Mock).mock.calls[1];
    const repairContext = secondCallArgs[1] as RepairContext;
    expect(repairContext).toBeDefined();
    expect(repairContext.previousOutput).toBe(invalidFirstResponse);
    expect(repairContext.errors.length).toBeGreaterThan(0);
    expect(repairContext.errors[0]).toContain('Invalid node count');
  });

  it('should throw UnprocessableEntityError when second response is also invalid', async () => {
    const invalidResponse = JSON.stringify({
      title: 'Invalid',
      rootId: 'missing-root',
      nodes: [{ id: 'n1', label: 'L1', summary: 'S1' }],
      connections: [{ id: 'c1', from: 'n1', to: 'n99' }],
    });

    const mockLlmClient: LlmClient = {
      generateMindmap: jest.fn().mockResolvedValue(invalidResponse),
    };

    const service = new MindmapService(mockLlmClient);

    await expect(
      service.generateAndValidateMindmap('Sample text for failure testing.')
    ).rejects.toThrow(UnprocessableEntityError);

    // Assert that retry attempt occurred exactly ONCE (total 2 calls)
    expect(mockLlmClient.generateMindmap).toHaveBeenCalledTimes(2);
  });

  it('should truncate inputs exceeding 12,000 chars and set truncated: true', async () => {
    const mockLlmClient: LlmClient = {
      generateMindmap: jest.fn().mockResolvedValue(JSON.stringify(mockGeneralMindmap)),
    };

    const longText = 'A'.repeat(13000);
    const service = new MindmapService(mockLlmClient);
    const result = await service.generateAndValidateMindmap(longText);

    expect(result.truncated).toBe(true);
    expect(mockLlmClient.generateMindmap).toHaveBeenCalledTimes(1);

    const passedText = (mockLlmClient.generateMindmap as jest.Mock).mock.calls[0][0];
    expect(passedText.length).toBeLessThanOrEqual(12003); // 12000 + '...'
    expect(passedText.endsWith('...')).toBe(true);
  });
});
