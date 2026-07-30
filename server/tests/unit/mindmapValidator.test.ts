import {
  validateNodeCount,
  validateUniqueNodeIds,
  validateRootId,
  validateConnections,
  validateMindmapDomainRules,
  parseAndValidateMindmapOutput,
} from '../../src/validators/mindmapValidator';
import { mockGeneralMindmap } from '../../src/fixtures/mockMindmaps';
import { Mindmap } from '@visualli/shared';

describe('mindmapValidator Domain Rules', () => {
  it('should validate node count between 5 and 9 inclusive', () => {
    expect(validateNodeCount(mockGeneralMindmap)).toBeNull();

    const tooFew: Mindmap = {
      ...mockGeneralMindmap,
      nodes: mockGeneralMindmap.nodes.slice(0, 3), // 3 nodes
    };
    expect(validateNodeCount(tooFew)).toContain('Invalid node count');

    const tooMany: Mindmap = {
      ...mockGeneralMindmap,
      nodes: Array(10).fill(null).map((_, i) => ({
        id: `node-${i}`,
        label: `Label ${i}`,
        summary: `Summary ${i}`,
      })),
    };
    expect(validateNodeCount(tooMany)).toContain('Invalid node count');
  });

  it('should detect duplicate node IDs', () => {
    const duplicateIds: Mindmap = {
      ...mockGeneralMindmap,
      nodes: [
        { id: 'n1', label: 'L1', summary: 'S1' },
        { id: 'n2', label: 'L2', summary: 'S2' },
        { id: 'n3', label: 'L3', summary: 'S3' },
        { id: 'n4', label: 'L4', summary: 'S4' },
        { id: 'n1', label: 'L1 Dup', summary: 'S1 Dup' }, // duplicate n1
      ],
    };
    expect(validateUniqueNodeIds(duplicateIds)).toContain('Duplicate node IDs found');
  });

  it('should detect invalid rootId', () => {
    const invalidRoot: Mindmap = {
      ...mockGeneralMindmap,
      rootId: 'non-existent-root-id',
    };
    expect(validateRootId(invalidRoot)).toContain("Invalid rootId 'non-existent-root-id'");
  });

  it('should detect dangling connection edges', () => {
    const dangling: Mindmap = {
      ...mockGeneralMindmap,
      connections: [
        { id: 'c1', from: 'unknown-node-a', to: mockGeneralMindmap.nodes[0].id },
        { id: 'c2', from: mockGeneralMindmap.nodes[0].id, to: 'unknown-node-b' },
      ],
    };
    const errors = validateConnections(dangling);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain("from' node ID 'unknown-node-a' does not exist");
    expect(errors[1]).toContain("to' node ID 'unknown-node-b' does not exist");
  });

  it('should return itemized failure array in validateMindmapDomainRules', () => {
    const brokenMindmap: Mindmap = {
      title: 'Broken',
      rootId: 'missing-root',
      nodes: [
        { id: 'n1', label: 'L1', summary: 'S1' },
        { id: 'n1', label: 'L2', summary: 'S2' }, // dup n1
      ], // 2 nodes (node count error)
      connections: [
        { id: 'conn1', from: 'n1', to: 'n99' }, // dangling n99
      ],
    };

    const errors = validateMindmapDomainRules(brokenMindmap);
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.some((e) => e.includes('Invalid node count'))).toBe(true);
    expect(errors.some((e) => e.includes('Duplicate node IDs'))).toBe(true);
    expect(errors.some((e) => e.includes("Invalid rootId 'missing-root'"))).toBe(true);
    expect(errors.some((e) => e.includes("to' node ID 'n99' does not exist"))).toBe(true);
  });

  it('should parse valid JSON string cleanly', () => {
    const validJson = JSON.stringify(mockGeneralMindmap);
    const result = parseAndValidateMindmapOutput(validJson);
    expect(result.isValid).toBe(true);
    expect(result.mindmap?.title).toBe(mockGeneralMindmap.title);
    expect(result.errors).toHaveLength(0);
  });
});
