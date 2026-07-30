/**
 * Rough estimation of tokens based on character count (~4 characters per token).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text deterministically to maxChars limit.
 */
export function truncateInput(
  text: string,
  maxChars = 12000
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  const truncatedText = text.slice(0, maxChars) + '...';
  return { text: truncatedText, truncated: true };
}
