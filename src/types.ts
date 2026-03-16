// ─── OpenAI-compatible types ────────────────────────────────────────

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model?: string;
  messages: OpenAIMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  // All other params (frequency_penalty, presence_penalty, etc.) are ignored
  [key: string]: unknown;
}

export interface OpenAIChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

export interface OpenAIStreamChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
  };
  finish_reason: string | null;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

export interface OpenAIStreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: OpenAIStreamChoice[];
}

// ─── App config ─────────────────────────────────────────────────────

export interface AppConfig {
  apiKey: string;
  port: number;
  model: string;
  temperature: number;
  topP: number;
  staticContent?: string;
  lastUsage?: OpenAIUsage;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  port: 3000,
  model: 'gemma-3-27b-it',
  temperature: 0.7,
  topP: 0.95,
  staticContent: '',
};

// ─── Constants ──────────────────────────────────────────────────────

export const MAX_CONTEXT_TOKENS = 15_000;
export const CHARS_PER_TOKEN = 4;
export const DEFAULT_MAX_OUTPUT_TOKENS = 4096;
