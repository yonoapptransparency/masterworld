import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

/**
 * Industrial-Grade Ultra-Low-Latency Gemini AI Service (2026 Gemini 3.8 + Interactions API Engine)
 * Features:
 * - Native support for `gemini-3.8-flash`, `gemini-3.1-flash-lite`, and `gemini-flash-latest`
 * - Supports both `@google/genai` v2.31+ Interactions API (`ai.interactions.create`) and `generateContent`
 * - Uses `thinkingLevel: 'MINIMAL'` / `'LOW'` on Gemini 3.x models to eliminate 15-30s HIGH thinking delays
 * - Never sets restrictive `maxOutputTokens` that starve output when thinking tokens are counted
 * - Automatically maps deprecated `gemini-2.5-flash` / `gemini-2.0-flash` / `gemini-1.5-flash` to `gemini-3.8-flash`
 * - Strict AbortController timeouts so requests never hang
 */

export interface GeminiCallParams {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  contents: any[];
  temperature?: number;
  responseMimeType?: string;
  useReviewSchema?: boolean;
}

const MODEL_ALIAS_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-3.8-flash',
  'gemini-2.5-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-3.7-flash': 'gemini-3.8-flash',
  'gemini-3.6-flash': 'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest': 'gemini-3.1-flash-lite',
  'gemini-3.8-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-2.0-flash': 'gemini-3.8-flash',
  'gemini-2.0-flash-exp': 'gemini-3.8-flash',
  'gemini-1.5-flash': 'gemini-3.8-flash',
  'gemini-1.5-pro': 'gemini-3.8-flash'
};

// Track models that returned "no longer available to new users" or 404 per key fingerprint
const retiredModelsPerKey = new Map<string, Set<string>>();

export function normalizeGeminiModel(rawModel?: string): string {
  const trimmed = String(rawModel || '').trim().replace(/^models\//i, '');
  if (!trimmed) return 'gemini-3.8-flash';
  if (MODEL_ALIAS_MAP[trimmed]) {
    return MODEL_ALIAS_MAP[trimmed];
  }
  return trimmed;
}

export const REVIEW_ARRAY_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  description: 'List of realistic, human-written user reviews grounded in the app profile and admin instructions.',
  items: {
    type: Type.OBJECT,
    properties: {
      userName: {
        type: Type.STRING,
        description: 'Realistic everyday user display name (varied formatting, never repetitive).'
      },
      rating: {
        type: Type.INTEGER,
        description: 'Star rating integer from 1 to 5.'
      },
      reviewText: {
        type: Type.STRING,
        description: 'Authentic human comment text matching the requested platform style, tone, and app details.'
      }
    },
    required: ['userName', 'rating', 'reviewText']
  }
};

function getKeyFingerprint(apiKey: string): string {
  const clean = apiKey.trim();
  if (clean.length <= 12) return clean;
  return `${clean.slice(0, 8)}_${clean.length}_${clean.slice(-4)}`;
}

function markModelRetiredForKey(apiKey: string, model: string): void {
  const fp = getKeyFingerprint(apiKey);
  if (!retiredModelsPerKey.has(fp)) {
    retiredModelsPerKey.set(fp, new Set());
  }
  retiredModelsPerKey.get(fp)!.add(model.replace(/^models\//i, ''));
}

function isModelRetiredForKey(apiKey: string, model: string): boolean {
  const fp = getKeyFingerprint(apiKey);
  const set = retiredModelsPerKey.get(fp);
  return Boolean(set && set.has(model.replace(/^models\//i, '')));
}

/**
 * Builds an ordered list of fast, active candidate models.
 * Always prioritizes `gemini-3.8-flash`, `gemini-3.1-flash-lite`, and `gemini-flash-latest`.
 * Never filters out `gemini-3.8-flash` based on legacy `/v1beta/models` metadata.
 */
export function buildSmartCandidateModels(requestedModel: string, apiKey?: string): string[] {
  const cleanRequested = String(requestedModel || '').trim().replace(/^models\//i, '');
  const normalized = normalizeGeminiModel(cleanRequested);

  const rawPriority = [
    normalized,
    cleanRequested,
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ].filter((m, idx, arr) => {
    if (!m) return false;
    // Never include retired 2.5/2.0/1.5 models unless nothing else exists
    if (m === 'gemini-2.5-flash' || m === 'gemini-2.0-flash' || m === 'gemini-1.5-flash') {
      return false;
    }
    if (apiKey && isModelRetiredForKey(apiKey, m)) {
      return false;
    }
    return arr.indexOf(m) === idx;
  });

  return rawPriority.slice(0, 3);
}

/**
 * Converts multi-turn `contents` array into a clean text prompt for Interactions API fallback.
 */
function flattenContentsToInput(contents: any[]): string {
  if (!Array.isArray(contents) || contents.length === 0) return 'Hello';
  if (contents.length === 1) {
    const parts = contents[0]?.parts || [];
    return parts.map((p: any) => p?.text || '').join('\n').trim() || 'Hello';
  }
  return contents
    .map((turn: any) => {
      const role = turn?.role === 'model' ? 'Assistant' : 'Admin';
      const text = (turn?.parts || []).map((p: any) => p?.text || '').join('\n').trim();
      return `${role}: ${text}`;
    })
    .join('\n\n');
}

/**
 * Executes a single ultra-fast Gemini call with `thinkingLevel: 'MINIMAL'` (0 thinking lag),
 * automatic fallback without `thinkingConfig` if rejected, and `@google/genai` Interactions API support.
 */
async function callGeminiFastSingle(params: {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  contents: any[];
  temperature: number;
  responseMimeType?: string;
  useReviewSchema?: boolean;
  timeoutMs: number;
}): Promise<{ text: string; modelVersion: string }> {
  const {
    apiKey,
    model,
    systemInstruction,
    contents,
    temperature,
    responseMimeType,
    useReviewSchema,
    timeoutMs
  } = params;

  const cleanKey = apiKey.trim();
  const modelLower = model.toLowerCase();
  const isGemini3Or4 = modelLower.includes('3.') || modelLower.includes('4-') || modelLower === 'gemini-flash-latest';

  // Helper to run REST :generateContent with or without thinkingConfig
  const attemptRestGenerateContent = async (includeThinkingConfig: boolean): Promise<{ text: string; modelVersion: string }> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const generationConfig: Record<string, any> = {
        temperature
      };

      if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
      }

      if (includeThinkingConfig) {
        if (isGemini3Or4 && !modelLower.includes('4-argon')) {
          generationConfig.thinkingConfig = { thinkingLevel: 'MINIMAL' };
        } else if (modelLower.includes('2.5-flash')) {
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }
      }

      const bodyPayload: Record<string, any> = {
        contents,
        generationConfig
      };

      if (systemInstruction && systemInstruction.trim()) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction.trim() }]
        };
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': cleanKey,
          'User-Agent': 'aistudio-build'
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status} (${res.statusText})`;
        const errorObj: any = new Error(errMsg);
        errorObj.status = res.status;
        throw errorObj;
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textParts = parts
        .filter((p: any) => typeof p?.text === 'string' && !p?.thought)
        .map((p: any) => p.text)
        .join('')
        .trim();
      const extractedText = textParts || String(parts[0]?.text || '').trim();

      if (!extractedText) {
        throw new Error('Model returned an empty response');
      }

      return {
        text: extractedText,
        modelVersion: data?.modelVersion || model
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err?.name === 'AbortError') {
        throw new Error(`Model ${model} timed out after ${Math.round(timeoutMs / 1000)}s`);
      }
      throw err;
    }
  };

  try {
    return await attemptRestGenerateContent(true);
  } catch (firstErr: any) {
    const msg = String(firstErr?.message || '');

    // If model is retired for new users, mark it immediately and rethrow so caller switches model
    if (msg.includes('no longer available to new users') || msg.includes('not found') || firstErr?.status === 404) {
      markModelRetiredForKey(cleanKey, model);
      throw firstErr;
    }

    // If thinkingConfig / thinkingLevel caused a 400 Invalid Argument on this model, retry immediately without thinkingConfig
    if (firstErr?.status === 400 && (msg.toLowerCase().includes('thinking') || msg.toLowerCase().includes('invalid argument') || msg.toLowerCase().includes('unknown name'))) {
      try {
        return await attemptRestGenerateContent(false);
      } catch (secondErr: any) {
        firstErr = secondErr;
      }
    }

    // Fallback: Try official @google/genai v2.31+ Interactions API (`ai.interactions.create`) or `ai.models.generateContent`
    if (!msg.includes('API_KEY_INVALID') && !msg.includes('API key not valid') && !msg.includes('timed out')) {
      try {
        const ai = new GoogleGenAI({
          apiKey: cleanKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        // 1. Try Interactions API (`ai.interactions.create`) which Google recommends for Gemini 3.8 Flash
        if ((ai as any).interactions?.create) {
          const interactionParams: Record<string, any> = {
            model,
            input: flattenContentsToInput(contents),
            store: false,
            generation_config: {
              temperature,
              ...(isGemini3Or4 && !modelLower.includes('4-argon') ? { thinking_level: 'minimal' } : {})
            }
          };
          if (systemInstruction && systemInstruction.trim()) {
            interactionParams.system_instruction = systemInstruction.trim();
          }
          if (useReviewSchema) {
            interactionParams.response_format = REVIEW_ARRAY_RESPONSE_SCHEMA;
          }

          const interaction = await (ai as any).interactions.create(interactionParams, { timeout: timeoutMs });
          let fullOutput = '';
          if (Array.isArray(interaction?.steps)) {
            for (const step of interaction.steps) {
              if (step?.type === 'model_output' && Array.isArray(step.content)) {
                for (const c of step.content) {
                  if (c?.type === 'text' && c.text) {
                    fullOutput += c.text;
                  }
                }
              }
            }
          }
          const finalOut = (fullOutput || interaction?.output_text || '').trim();
          if (finalOut) {
            return { text: finalOut, modelVersion: model };
          }
        }

        // 2. Try SDK `ai.models.generateContent`
        const sdkConfig: Record<string, any> = { temperature };
        if (systemInstruction) sdkConfig.systemInstruction = systemInstruction;
        if (responseMimeType) sdkConfig.responseMimeType = responseMimeType;
        if (isGemini3Or4 && !modelLower.includes('4-argon')) {
          sdkConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const sdkRes = await ai.models.generateContent({
          model,
          contents,
          config: sdkConfig
        });
        if (sdkRes.text && sdkRes.text.trim()) {
          return {
            text: sdkRes.text.trim(),
            modelVersion: model
          };
        }
      } catch (sdkErr: any) {
        const sdkMsg = String(sdkErr?.message || '');
        if (sdkMsg.includes('no longer available to new users')) {
          markModelRetiredForKey(cleanKey, model);
        }
      }
    }

    throw firstErr;
  }
}

export async function testGeminiConnection(
  apiKey: string,
  requestedModel = 'gemini-3.8-flash'
): Promise<{
  success: boolean;
  model: string;
  requestedModel: string;
  latencyMs: number;
  supportedModels?: string[];
  message?: string;
  error?: string;
}> {
  const cleanKey = (apiKey || '').trim();
  const normalizedModel = normalizeGeminiModel(requestedModel);

  if (!cleanKey) {
    return {
      success: false,
      model: normalizedModel,
      requestedModel,
      latencyMs: 0,
      error: 'API key is required. Paste a valid Google AI Studio API key.'
    };
  }

  const startTime = Date.now();
  const candidates = buildSmartCandidateModels(normalizedModel, cleanKey);
  let lastError = '';

  // Step 1: Live ultra-fast verification ping on the actual candidate model (with MINIMAL thinking)
  for (const modelToTry of candidates) {
    try {
      const ping = await callGeminiFastSingle({
        apiKey: cleanKey,
        model: modelToTry,
        contents: [{ role: 'user', parts: [{ text: 'Reply with one word: Connected' }] }],
        temperature: 0.1,
        timeoutMs: 6500
      });

      return {
        success: true,
        model: modelToTry,
        requestedModel,
        latencyMs: Date.now() - startTime,
        message: ping.text || 'AI Connected & Verified'
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
      if (
        lastError.includes('API_KEY_INVALID') ||
        lastError.includes('API key not valid') ||
        lastError.includes('UNAUTHENTICATED') ||
        err?.status === 401 ||
        err?.status === 403
      ) {
        return {
          success: false,
          model: normalizedModel,
          requestedModel,
          latencyMs: Date.now() - startTime,
          error: 'Invalid Gemini API Key. Please check your key in Google AI Studio.'
        };
      }
    }
  }

  // Step 2: Fallback check via /v1beta/models if generateContent was rate-limited
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=50&key=${encodeURIComponent(cleanKey)}`,
      { method: 'GET', signal: controller.signal }
    );
    clearTimeout(timer);
    if (res.ok) {
      return {
        success: true,
        model: normalizedModel,
        requestedModel,
        latencyMs: Date.now() - startTime,
        message: 'API Key Validated'
      };
    }
  } catch (_) {}

  return {
    success: false,
    model: normalizedModel,
    requestedModel,
    latencyMs: Date.now() - startTime,
    error: lastError || 'Connection test failed. Please verify your Gemini API key.'
  };
}

export async function executeGeminiWithRetry(params: GeminiCallParams): Promise<{
  success: boolean;
  text?: string;
  modelUsed: string;
  requestedModel: string;
  attempts: number;
  latencyMs: number;
  error?: string;
}> {
  const {
    apiKey,
    systemInstruction,
    contents,
    temperature = 0.85,
    responseMimeType,
    useReviewSchema
  } = params;

  const cleanKey = (apiKey || '').trim();
  const requestedModel = normalizeGeminiModel(params.model || 'gemini-3.8-flash');
  const startTime = Date.now();

  if (!cleanKey) {
    return {
      success: false,
      modelUsed: requestedModel,
      requestedModel,
      attempts: 0,
      latencyMs: 0,
      error: 'Gemini API key is missing.'
    };
  }

  const modelCandidates = buildSmartCandidateModels(requestedModel, cleanKey);
  let attempts = 0;
  let lastError = '';

  for (const currentModel of modelCandidates) {
    attempts++;
    try {
      const res = await callGeminiFastSingle({
        apiKey: cleanKey,
        model: currentModel,
        systemInstruction,
        contents,
        temperature,
        responseMimeType,
        useReviewSchema,
        timeoutMs: 14000
      });

      return {
        success: true,
        text: res.text,
        modelUsed: currentModel,
        requestedModel,
        attempts,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      lastError = err?.message || String(err);

      const isAuthError =
        lastError.includes('API_KEY_INVALID') ||
        lastError.includes('API key not valid') ||
        lastError.includes('UNAUTHENTICATED');
      if (isAuthError) {
        return {
          success: false,
          modelUsed: currentModel,
          requestedModel,
          attempts,
          latencyMs: Date.now() - startTime,
          error: 'Invalid Gemini API Key. Please check your key in AI Studio Key settings.'
        };
      }
    }
  }

  return {
    success: false,
    modelUsed: modelCandidates[0] || requestedModel,
    requestedModel,
    attempts,
    latencyMs: Date.now() - startTime,
    error: lastError || 'Unable to reach Gemini API. Please check your key or select gemini-3.8-flash.'
  };
}
