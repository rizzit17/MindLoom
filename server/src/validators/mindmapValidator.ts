import { Mindmap, MindmapSchema } from '@visualli/shared';
import { ZodError } from 'zod';

export function validateNodeCount(mindmap: Mindmap): string | null {
  const count = mindmap.nodes.length;
  if (count < 5 || count > 9) {
    return `Invalid node count: mindmap has ${count} nodes (must be between 5 and 9 inclusive).`;
  }
  return null;
}

export function validateUniqueNodeIds(mindmap: Mindmap): string | null {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const node of mindmap.nodes) {
    if (seen.has(node.id)) {
      duplicates.add(node.id);
    } else {
      seen.add(node.id);
    }
  }

  if (duplicates.size > 0) {
    return `Duplicate node IDs found: ${Array.from(duplicates).map((id) => `'${id}'`).join(', ')}.`;
  }
  return null;
}

export function validateRootId(mindmap: Mindmap): string | null {
  const nodeIds = new Set(mindmap.nodes.map((n) => n.id));
  if (!nodeIds.has(mindmap.rootId)) {
    return `Invalid rootId '${mindmap.rootId}': no node exists with this ID.`;
  }
  return null;
}

export function validateConnections(mindmap: Mindmap): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(mindmap.nodes.map((n) => n.id));

  for (const conn of mindmap.connections) {
    if (!nodeIds.has(conn.from)) {
      errors.push(`Dangling connection '${conn.id}': 'from' node ID '${conn.from}' does not exist.`);
    }
    if (!nodeIds.has(conn.to)) {
      errors.push(`Dangling connection '${conn.id}': 'to' node ID '${conn.to}' does not exist.`);
    }
  }

  return errors;
}

export function validateMindmapDomainRules(mindmap: Mindmap): string[] {
  const errors: string[] = [];

  const countError = validateNodeCount(mindmap);
  if (countError) errors.push(countError);

  const uniqueError = validateUniqueNodeIds(mindmap);
  if (uniqueError) errors.push(uniqueError);

  const rootError = validateRootId(mindmap);
  if (rootError) errors.push(rootError);

  const connectionErrors = validateConnections(mindmap);
  errors.push(...connectionErrors);

  return errors;
}

export interface MindmapValidationResult {
  isValid: boolean;
  mindmap?: Mindmap;
  errors: string[];
}

export function parseAndValidateMindmapOutput(rawJson: string): MindmapValidationResult {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawJson);
  } catch (err) {
    return {
      isValid: false,
      errors: [`JSON syntax error: unable to parse LLM response string (${err instanceof Error ? err.message : String(err)})`],
    };
  }

  const zodResult = MindmapSchema.safeParse(parsedJson);
  if (!zodResult.success) {
    const zodErrors = (zodResult.error as ZodError).errors.map(
      (e) => `Schema validation error at path '${e.path.join('.')}': ${e.message}`
    );
    return {
      isValid: false,
      errors: zodErrors,
    };
  }

  const mindmap = zodResult.data as Mindmap;
  const domainErrors = validateMindmapDomainRules(mindmap);

  if (domainErrors.length > 0) {
    return {
      isValid: false,
      mindmap,
      errors: domainErrors,
    };
  }

  return {
    isValid: true,
    mindmap,
    errors: [],
  };
}
