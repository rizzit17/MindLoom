import { BadRequestError } from '../middleware/errorHandler';

export interface ValidatedMindmapInput {
  text: string;
}

export function validateCreateMindmapRequest(body: unknown): ValidatedMindmapInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError('Request body must be a JSON object.');
  }

  const { text } = body as { text?: unknown };

  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new BadRequestError('Text input is required and cannot be empty.');
  }

  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).length;

  if (trimmed.length < 20 || wordCount < 4) {
    throw new BadRequestError(
      'Input text is too short to summarize meaningfully. Please provide at least 20 characters and a few words of content.'
    );
  }

  return { text: trimmed };
}
