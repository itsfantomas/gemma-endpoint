import { OpenAIMessage, CHARS_PER_TOKEN, MAX_CONTEXT_TOKENS } from './types';

/**
 * Estimate token count for a string using the simple heuristic:
 * 1 token ≈ 4 characters
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate total tokens for an array of messages.
 */
export function estimateMessagesTokens(messages: OpenAIMessage[]): number {
  return messages.reduce((sum, msg) => {
    // Account for role overhead (~4 tokens per message for role + delimiters)
    return sum + estimateTokens(msg.content) + 4;
  }, 0);
}

/**
 * Trim messages array to fit within token limit.
 * 
 * Strategy:
 * - Always preserve the first message (system prompt, index 0)
 * - Remove the oldest non-system messages (starting from index 1)
 *   until total estimated tokens fit within maxTokens
 */
export function trimMessages(
  messages: OpenAIMessage[],
  maxTokens: number = MAX_CONTEXT_TOKENS
): OpenAIMessage[] {
  if (messages.length === 0) return messages;

  let result = [...messages];
  let totalTokens = estimateMessagesTokens(result);

  // Remove oldest messages (after system prompt) until within budget
  while (totalTokens > maxTokens && result.length > 1) {
    // Remove the second message (oldest non-system)
    const removed = result.splice(1, 1)[0];
    totalTokens -= estimateTokens(removed.content) + 4;
  }

  if (totalTokens > maxTokens && result.length === 1) {
    console.warn(
      `⚠ System prompt alone is ~${totalTokens} tokens, exceeding limit of ${maxTokens}`
    );
  }

  return result;
}
