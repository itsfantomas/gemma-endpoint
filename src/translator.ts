import {
  OpenAIMessage,
  OpenAIResponse,
  OpenAIUsage,
  DEFAULT_MAX_OUTPUT_TOKENS,
} from './types';
import { Content, Part } from '@google/generative-ai';

// ─── Allowed generation parameters ─────────────────────────────────
// Only these params are forwarded to Gemini. Everything else is stripped.
const ALLOWED_GEN_PARAMS = new Set(['temperature', 'topP', 'top_p', 'maxOutputTokens', 'max_tokens']);

/**
 * Convert OpenAI messages array → Gemini contents array.
 * System messages are prepended as a user message followed by an "Understood." model response.
 */
export function toGeminiContents(messages: OpenAIMessage[]): {
  contents: Content[];
} {
  let systemInstruction: string | undefined;
  const contents: Content[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Concatenate multiple system messages (rare but possible)
      systemInstruction = systemInstruction
        ? systemInstruction + '\n' + msg.content
        : msg.content;
      continue;
    }

    const role = msg.role === 'assistant' ? 'model' : 'user';
    const parts: Part[] = [{ text: msg.content }];
    contents.push({ role, parts });
  }

  if (systemInstruction) {
    contents.unshift(
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood.' }] }
    );
  }

  return { contents };
}

/**
 * Build Gemini generationConfig from OpenAI request params.
 * - Remap max_tokens → maxOutputTokens (default: 4096)
 * - Pass temperature and top_p as-is
 * - STRIP all other parameters to avoid 400 errors
 */
export function buildGenerationConfig(params: Record<string, unknown>): Record<string, unknown> {
  const config: Record<string, unknown> = {};

  // temperature
  if (typeof params.temperature === 'number') {
    config.temperature = params.temperature;
  }

  // top_p → topP
  if (typeof params.top_p === 'number') {
    config.topP = params.top_p;
  }

  // max_tokens → maxOutputTokens
  if (typeof params.max_tokens === 'number') {
    config.maxOutputTokens = params.max_tokens;
  } else {
    config.maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS;
  }

  return config;
}

/**
 * Repackage Gemini response into OpenAI response format.
 */
export function toOpenAIResponse(
  text: string,
  model: string,
  usage?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
): OpenAIResponse {
  const usageData: OpenAIUsage = {
    prompt_tokens: usage?.promptTokenCount ?? 0,
    completion_tokens: usage?.candidatesTokenCount ?? 0,
    total_tokens: usage?.totalTokenCount ?? 0,
  };

  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
    usage: usageData,
  };
}

/**
 * Build a single SSE stream chunk in OpenAI format.
 */
export function buildStreamChunk(
  text: string,
  model: string,
  isFirst: boolean = false
): string {
  const chunk = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta: isFirst
          ? { role: 'assistant' as const, content: text }
          : { content: text },
        finish_reason: null,
      },
    ],
  };
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Build the final SSE stream chunk containing usage metadata.
 * OpenAI streams that have `stream_options.include_usage: true` expect this format.
 */
export function buildStreamUsageChunk(
  model: string,
  usageData: OpenAIUsage
): string {
  const chunk = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [],
    usage: usageData,
  };
  return `data: ${JSON.stringify(chunk)}\n\n`;
}
