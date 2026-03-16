import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { configManager } from '../config';
import { trimMessages } from '../context';
import { toGeminiContents, buildGenerationConfig, toOpenAIResponse } from '../translator';
import { handleStream } from '../stream';
import { OpenAIRequest } from '../types';

const router = Router();

// Safety settings: BLOCK_NONE for all categories
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * POST /v1/chat/completions
 * 
 * Accepts OpenAI-format requests and proxies them to Google AI Studio.
 * Supports both streaming and non-streaming modes.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as OpenAIRequest;
    const config = configManager.get();

    // Validate API key
    if (!config.apiKey) {
      res.status(500).json({
        error: {
          message: 'Google API key is not configured. Set it via the web interface.',
          type: 'server_error',
        },
      });
      return;
    }

    // Validate messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      res.status(400).json({
        error: {
          message: 'messages array is required and must not be empty.',
          type: 'invalid_request_error',
        },
      });
      return;
    }

    const isStream = body.stream === true;
    const model = config.model || 'gemma-3-27b-it';

    // 1. Trim context to fit within token limit
    const trimmedMessages = trimMessages(body.messages);

    // 2. Convert to Gemini format
    const { contents } = toGeminiContents(trimmedMessages);

    // 3. Build generation config (only allowed params)
    const generationConfig = buildGenerationConfig({
      temperature: body.temperature ?? config.temperature,
      top_p: body.top_p ?? config.topP,
      max_tokens: body.max_tokens,
    });

    // 4. Initialize Gemini client
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      safetySettings,
      generationConfig,
    });

    console.log("==================================================");
    console.log("REQUEST TO GOOGLE:", JSON.stringify(contents, null, 2));
    console.log("==================================================");

    // 5. Stream or non-stream
    if (isStream) {
      const streamResult = await geminiModel.generateContentStream({ contents });
      await handleStream(streamResult, res, model);
    } else {
      const result = await geminiModel.generateContent({ contents });
      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      const openAIResponse = toOpenAIResponse(text, model, {
        promptTokenCount: usage?.promptTokenCount,
        candidatesTokenCount: usage?.candidatesTokenCount,
        totalTokenCount: usage?.totalTokenCount,
      });

      // Store last usage for the frontend context estimator
      (globalThis as any).__lastUsage = openAIResponse.usage;
      
      // Save permanently to config override
      configManager.save({
        lastUsage: openAIResponse.usage
      });

      res.json(openAIResponse);
    }
  } catch (err: any) {
    console.error('⚠ Proxy error:', err?.message || err);

    // Determine appropriate status code
    const status = err?.status || err?.httpStatusCode || 500;
    const message = err?.message || 'Internal proxy error';

    // For streaming, try to close gracefully
    if (!res.headersSent) {
      res.status(status).json({
        error: {
          message,
          type: 'proxy_error',
        },
      });
    } else {
      res.end();
    }
  }
});

export default router;
