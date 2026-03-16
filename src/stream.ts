import { Response } from 'express';
import { GenerateContentStreamResult } from '@google/generative-ai';
import { buildStreamChunk, buildStreamUsageChunk } from './translator';
import { configManager } from './config';

/**
 * Set SSE headers and pipe Gemini streaming response as OpenAI-compatible
 * Server-Sent Events chunks.
 * 
 * Ends with `data: [DONE]\n\n` as per OpenAI spec.
 */
export async function handleStream(
  streamResult: GenerateContentStreamResult,
  res: Response,
  model: string
): Promise<void> {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  let isFirst = true;
  let fullText = '';

  try {
    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        fullText += text;
        const sseData = buildStreamChunk(text, model, isFirst);
        res.write(sseData);
        isFirst = false;
      }
    }

    // After stream completes, grab usage metadata if available
    try {
      const response = await streamResult.response;
      const usage = response.usageMetadata;
      
      let promptTokens = usage?.promptTokenCount ?? 0;
      let completionTokens = usage?.candidatesTokenCount ?? 0;
      let totalTokens = usage?.totalTokenCount ?? 0;

      if (!completionTokens) {
        completionTokens = Math.ceil(fullText.length / 4);
        totalTokens = promptTokens + completionTokens;
      }

      const usageData = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      };
      
      // 1. Send the final usage chunk down the stream
      const usageChunk = buildStreamUsageChunk(model, usageData);
      res.write(usageChunk);

      // 2. Store globally and save
      (globalThis as any).__lastUsage = usageData;
      configManager.save({ lastUsage: usageData });
    } catch (e) {
      console.error('⚠ Failed to save stream usage metadata:', e);
    }

    // Send final [DONE] marker
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('⚠ Streaming error:', err);
    // Try to send error chunk before closing
    try {
      const errorChunk = buildStreamChunk(
        '\n\n[Streaming interrupted due to an error]',
        model
      );
      res.write(errorChunk);
      res.write('data: [DONE]\n\n');
    } catch {
      // Response may already be closed
    }
    res.end();
  }
}
