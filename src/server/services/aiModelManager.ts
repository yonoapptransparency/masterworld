/**
 * Centralized Gemini AI Model Manager
 * Supports dynamic switching between top-tier Google GenAI models,
 * provides live model telemetry, and serves as single source of truth.
 */

export interface AiModelSpec {
  id: string;
  name: string;
  tier: 'fast' | 'pro' | 'standard';
  description: string;
  badge: string;
  contextWindow: string;
  recommendedFor: string;
}

export const AVAILABLE_GEMINI_MODELS: AiModelSpec[] = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tier: "fast",
    description: "Top-tier flagship high-reasoning model. Peak comprehension, speed, and authentic roleplay intelligence.",
    badge: "Flagship Powerful (Default)",
    contextWindow: "1,000,000+ tokens",
    recommendedFor: "Flagship Reviews, Live Grounding, High-Speed Autopilot"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    tier: "pro",
    description: "Deep thinking and reasoning pro model. Exhaustive HTML table, rule breakdown, and complex multi-pass analysis.",
    badge: "Maximum Reasoning Pro",
    contextWindow: "2,000,000+ tokens",
    recommendedFor: "Brain 1 Dossier Analysis & Complex HTML Parsing"
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    tier: "fast",
    description: "Always points to the newest updated Google Flash model with latest capabilities.",
    badge: "Auto-Updated Latest",
    contextWindow: "1,000,000+ tokens",
    recommendedFor: "Cutting-Edge Intelligence & Web Synthesis"
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tier: "fast",
    description: "Ultra-fast generation optimized for massive multi-app catalog rollouts.",
    badge: "Ultra Fast",
    contextWindow: "1,000,000+ tokens",
    recommendedFor: "1-Click Category Bulk Batch & High-Throughput Queue"
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tier: "pro",
    description: "Advanced pro reasoning model with deep nuance and structured synthesis.",
    badge: "Deep Dossier Pro",
    contextWindow: "2,000,000+ tokens",
    recommendedFor: "Detailed Sentiment & Technical Breakdown"
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tier: "fast",
    description: "High-performance model with adaptive multimodal reasoning.",
    badge: "High Performance",
    contextWindow: "1,000,000+ tokens",
    recommendedFor: "General Reviews & Grounded Search"
  }
];

let globalActiveModel: string = "gemini-3.8-flash";

export function getActiveAiModel(): string {
  return globalActiveModel;
}

export function setActiveAiModel(modelId: string): { success: boolean; activeModel: string; modelSpec?: AiModelSpec } {
  const matched = AVAILABLE_GEMINI_MODELS.find(m => m.id === modelId);
  if (matched) {
    globalActiveModel = matched.id;
    return { success: true, activeModel: globalActiveModel, modelSpec: matched };
  }
  // Allow custom model id if valid format
  if (modelId && typeof modelId === 'string' && (modelId.startsWith('gemini-') || modelId.includes('flash') || modelId.includes('pro'))) {
    globalActiveModel = modelId;
    return { success: true, activeModel: globalActiveModel };
  }
  return { success: false, activeModel: globalActiveModel };
}

export function getCandidateModels(preferredModel?: string): string[] {
  const chosen = preferredModel || globalActiveModel;
  const list = [
    chosen,
    "gemini-3.8-flash",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.5-flash"
  ];
  return Array.from(new Set(list));
}

