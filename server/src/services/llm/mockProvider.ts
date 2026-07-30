import { LlmClient, RepairContext } from './llmClient';
import {
  mockFixtures,
  mockSoftwareArchitectureMindmap,
  mockAiMlMindmap,
  mockGeneralMindmap,
} from '../../fixtures/mockMindmaps';
import { Mindmap } from '@visualli/shared';

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockProvider implements LlmClient {
  private mockFixtureOverride: Mindmap | null = null;
  private rawOverrideString: string | null = null;

  constructor(overrideFixture?: Mindmap, rawOverrideString?: string) {
    if (overrideFixture) this.mockFixtureOverride = overrideFixture;
    if (rawOverrideString) this.rawOverrideString = rawOverrideString;
  }

  async generateMindmap(text: string, repairContext?: RepairContext): Promise<string> {
    // Artificial delay to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (this.rawOverrideString) {
      return this.rawOverrideString;
    }

    if (this.mockFixtureOverride) {
      return JSON.stringify(this.mockFixtureOverride);
    }

    // If repair context is provided, return a clean valid fixture to simulate successful repair
    if (repairContext) {
      return JSON.stringify(mockGeneralMindmap);
    }

    const lower = text.toLowerCase();

    if (
      lower.includes('software') ||
      lower.includes('microservice') ||
      lower.includes('architecture') ||
      lower.includes('code')
    ) {
      return JSON.stringify(mockSoftwareArchitectureMindmap);
    }

    if (
      lower.includes('ai') ||
      lower.includes('intelligence') ||
      lower.includes('learning') ||
      lower.includes('model')
    ) {
      return JSON.stringify(mockAiMlMindmap);
    }

    // Deterministic string hash fallback to select amongst available fixtures
    const hashIndex = simpleHash(text) % mockFixtures.length;
    return JSON.stringify(mockFixtures[hashIndex]);
  }
}
