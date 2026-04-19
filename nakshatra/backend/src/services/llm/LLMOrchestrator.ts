import axios from 'axios';
import { Response } from 'express';
import { ollamaService, OllamaChatMessage } from './OllamaService';
import { ruleBasedEngine, KundliInterpretationParams } from './RuleBasedEngine';
import { claudeService } from './ClaudeService';

export type LLMDomain = 'kundli' | 'tarot' | 'numerology' | 'vastu' | 'scripture' | 'general';
export type LLMProvider = 'ollama' | 'groq' | 'openai' | 'claude' | 'rule-based';

// ── OpenAI-compatible provider call (Groq / OpenAI) ──────────────────────────
async function callOpenAICompat(
  messages: OllamaChatMessage[],
  apiKey: string,
  baseUrl: string,
  model: string,
): Promise<string | null> {
  try {
    const res = await axios.post(
      `${baseUrl}/chat/completions`,
      { model, messages, max_tokens: 1200, temperature: 0.7 },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30_000 },
    );
    return res.data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function* streamOpenAICompat(
  messages: OllamaChatMessage[],
  apiKey: string,
  baseUrl: string,
  model: string,
): AsyncGenerator<string> {
  const res = await axios.post(
    `${baseUrl}/chat/completions`,
    { model, messages, max_tokens: 1200, temperature: 0.7, stream: true },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, responseType: 'stream', timeout: 30_000 },
  );
  let buf = '';
  for await (const raw of res.data) {
    buf += raw.toString();
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* partial chunk */ }
    }
  }
}

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export interface LLMRequest {
  domain: LLMDomain;
  question: string;
  context: Record<string, unknown>;
  stream?: boolean;
  sessionId?: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  confidence: number;
  streaming: boolean;
  metadata?: Record<string, unknown>;
}

// Confidence threshold below which we escalate to next provider
const RULE_BASED_CONFIDENCE_THRESHOLD = 0.5;

export class LLMOrchestrator {
  /**
   * Build a structured Vedic astrology prompt for Ollama/Claude.
   */
  private buildPrompt(req: LLMRequest, ruleBasedContext?: string): OllamaChatMessage[] {
    const systemContent = `You are Nakshatra, a Vedic astrology and spiritual wisdom assistant.
You have deep knowledge of Jyotish (Vedic Astrology), Tarot, Numerology, Vastu Shastra, and Sanskrit scriptures.
IMPORTANT: Only interpret data that is explicitly provided. Do not fabricate planetary positions or chart details.
Respond with wisdom grounded in classical Vedic tradition. Be specific and avoid vague generalities.`;

    const contextStr = Object.keys(req.context).length > 0
      ? `\nPre-computed data (use as ground truth):\n${JSON.stringify(req.context, null, 2)}`
      : '';

    const ruleStr = ruleBasedContext
      ? `\nRule-based interpretation (expand with deeper wisdom):\n${ruleBasedContext}`
      : '';

    const userContent = `Domain: ${req.domain}\nQuestion: ${req.question}${contextStr}${ruleStr}\n\nProvide a comprehensive interpretation.`;

    return [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ];
  }

  /**
   * Generate a rule-based interpretation based on the domain and context.
   */
  private getRuleBasedInterpretation(req: LLMRequest): { content: string; confidence: number } {
    const ctx = req.context;

    try {
      switch (req.domain) {
        case 'kundli': {
          const params: KundliInterpretationParams = {
            lagna: ctx.lagna as string,
            moonSign: ctx.moonSign as string,
            sunSign: ctx.sunSign as string,
            nakshatraName: ctx.nakshatraName as string,
            planets: ctx.planets as KundliInterpretationParams['planets'],
            yogas: ctx.yogas as string[],
            doshas: ctx.doshas as string[],
            currentDasha: ctx.currentDasha as string,
          };
          const content = ruleBasedEngine.interpretKundli(params);
          const confidence = (params.lagna ? 0.3 : 0) +
            (params.moonSign ? 0.2 : 0) +
            (params.planets && params.planets.length > 0 ? 0.3 : 0) +
            (params.yogas && params.yogas.length > 0 ? 0.1 : 0) +
            (params.currentDasha ? 0.1 : 0);
          return { content, confidence };
        }

        case 'tarot': {
          const cardName = ctx.cardName as string || 'The Fool';
          const position = ctx.position as string || 'general';
          const isReversed = ctx.isReversed as boolean || false;
          const context = ctx.spreadContext as string || '';
          const interp = ruleBasedEngine.interpretTarot(cardName, position, isReversed, context);
          const content = `**${interp.cardName}** (${interp.position}${interp.isReversed ? ' — Reversed' : ''})\n\n${interp.meaning}\n\n**Guidance:** ${interp.advice}`;
          return { content, confidence: 0.75 };
        }

        case 'numerology': {
          const lifePathNumber = ctx.lifePathNumber as number;
          const expressionNumber = ctx.expressionNumber as number | undefined;
          if (!lifePathNumber) {
            return { content: 'Please provide a life path number for numerology interpretation.', confidence: 0.1 };
          }
          const interp = ruleBasedEngine.interpretNumerology(lifePathNumber, expressionNumber);
          const content = `**Life Path ${lifePathNumber}**\n\n${interp.meaning}\n\n**Key Traits:** ${interp.traits.join(', ')}\n\n**Core Challenges:** ${interp.challenges.join(', ')}\n\n**Guidance:** ${interp.advice}`;
          return { content, confidence: 0.85 };
        }

        case 'vastu': {
          const zone = ctx.zone as string || 'Center';
          const defects = ctx.defects as string[] || [];
          const interp = ruleBasedEngine.interpretVastu(zone, defects);
          const content = `**${interp.zone} Zone** — Element: ${interp.element} | Ruled by: ${interp.ruling}\n\n${interp.description}\n\n**Defect Analysis:**\n${interp.defectAnalysis.join('\n')}\n\n**Remedies:**\n${interp.remedies.map(r => `• ${r}`).join('\n')}`;
          return { content, confidence: 0.80 };
        }

        case 'scripture': {
          const shloka = ruleBasedEngine.getDailyShloka(new Date());
          const content = `**Today's Shloka**\n\n*${shloka.verse}*\n\n**Source:** ${shloka.source}\n\n**Translation:** ${shloka.translation}\n\n**Deeper Meaning:** ${shloka.meaning}`;
          return { content, confidence: 0.90 };
        }

        default:
          return { content: '', confidence: 0.0 };
      }
    } catch (err) {
      console.error('[RuleBasedEngine] Error:', err);
      return { content: '', confidence: 0.0 };
    }
  }

  /**
   * Main waterfall: Ollama → RuleBased → Claude
   */
  async process(req: LLMRequest): Promise<LLMResponse> {
    // Step 1: Gather rule-based interpretation first (used as context grounding)
    const ruleResult = this.getRuleBasedInterpretation(req);

    // Step 2: Try Ollama
    try {
      const ollamaAvailable = await ollamaService.isHealthy();
      if (ollamaAvailable) {
        const messages = this.buildPrompt(req, ruleResult.content);
        const content = await ollamaService.chat(messages, { temperature: 0.7, maxTokens: 1200 });

        if (content && content.trim().length > 100) {
          return {
            content,
            provider: 'ollama',
            confidence: 0.78,
            streaming: false,
            metadata: { model: ollamaService.getModel() },
          };
        }
      }
    } catch (err) {
      console.warn('[Orchestrator] Ollama unavailable or failed:', (err as Error).message);
    }

    // Step 3: Rule-based engine if confidence is sufficient
    if (ruleResult.confidence >= RULE_BASED_CONFIDENCE_THRESHOLD && ruleResult.content.trim().length > 50) {
      return {
        content: ruleResult.content,
        provider: 'rule-based',
        confidence: ruleResult.confidence,
        streaming: false,
      };
    }

    // Step 4: Groq (free tier, OpenAI-compatible)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const messages = this.buildPrompt(req, ruleResult.content);
      const groqContent = await callOpenAICompat(messages, groqKey, GROQ_BASE, GROQ_MODEL);
      if (groqContent && groqContent.trim().length > 100) {
        return { content: groqContent, provider: 'groq', confidence: 0.80, streaming: false, metadata: { model: GROQ_MODEL } };
      }
    }

    // Step 5: OpenAI (paid, cheap)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const messages = this.buildPrompt(req, ruleResult.content);
      const oaiContent = await callOpenAICompat(messages, openaiKey, OPENAI_BASE, OPENAI_MODEL);
      if (oaiContent && oaiContent.trim().length > 100) {
        return { content: oaiContent, provider: 'openai', confidence: 0.85, streaming: false, metadata: { model: OPENAI_MODEL } };
      }
    }

    // Step 6: Anthropic Claude (high quality, final cloud fallback)
    if (claudeService.isAvailable()) {
      try {
        const response = await claudeService.complete({
          domain: req.domain,
          question: req.question,
          computedData: req.context,
          ruleBasedInterpretation: ruleResult.content || undefined,
        });
        return {
          content: response.content,
          provider: 'claude',
          confidence: 0.92,
          streaming: false,
          metadata: {
            model: claudeService.getModel(),
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          },
        };
      } catch (err) {
        console.warn('[Orchestrator] Claude failed:', (err as Error).message);
      }
    }

    // Step 7: Return rule-based content regardless of confidence, or error message
    if (ruleResult.content.trim().length > 0) {
      return {
        content: ruleResult.content,
        provider: 'rule-based',
        confidence: ruleResult.confidence,
        streaming: false,
        metadata: { note: 'Fallback: all LLM providers unavailable' },
      };
    }

    return {
      content: 'All interpretation services are currently unavailable. Please ensure Ollama is running or configure a valid Claude API key. For immediate guidance, consult classical Vedic texts such as Brihat Parashara Hora Shastra.',
      provider: 'rule-based',
      confidence: 0.0,
      streaming: false,
    };
  }

  /**
   * Streaming waterfall: Ollama stream → Claude stream → RuleBased (non-streamed)
   */
  async processStream(req: LLMRequest, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendChunk = (data: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const ruleResult = this.getRuleBasedInterpretation(req);

    // Try Ollama streaming
    try {
      const ollamaAvailable = await ollamaService.isHealthy();
      if (ollamaAvailable) {
        const messages = this.buildPrompt(req, ruleResult.content);
        let hasContent = false;

        sendChunk({ type: 'start', provider: 'ollama' });

        for await (const chunk of ollamaService.chatStream(messages, { temperature: 0.7 })) {
          sendChunk({ type: 'delta', text: chunk });
          hasContent = true;
        }

        if (hasContent) {
          sendChunk({ type: 'done', provider: 'ollama' });
          res.end();
          return;
        }
      }
    } catch (err) {
      console.warn('[Orchestrator Stream] Ollama failed:', (err as Error).message);
    }

    // Try Groq streaming
    const groqKeyS = process.env.GROQ_API_KEY;
    if (groqKeyS) {
      try {
        const messages = this.buildPrompt(req, ruleResult.content);
        sendChunk({ type: 'start', provider: 'groq' });
        let hasGroq = false;
        for await (const chunk of streamOpenAICompat(messages, groqKeyS, GROQ_BASE, GROQ_MODEL)) {
          sendChunk({ type: 'delta', text: chunk });
          hasGroq = true;
        }
        if (hasGroq) { sendChunk({ type: 'done', provider: 'groq' }); res.end(); return; }
      } catch (err) {
        console.warn('[Orchestrator Stream] Groq failed:', (err as Error).message);
      }
    }

    // Try OpenAI streaming
    const openaiKeyS = process.env.OPENAI_API_KEY;
    if (openaiKeyS) {
      try {
        const messages = this.buildPrompt(req, ruleResult.content);
        sendChunk({ type: 'start', provider: 'openai' });
        let hasOAI = false;
        for await (const chunk of streamOpenAICompat(messages, openaiKeyS, OPENAI_BASE, OPENAI_MODEL)) {
          sendChunk({ type: 'delta', text: chunk });
          hasOAI = true;
        }
        if (hasOAI) { sendChunk({ type: 'done', provider: 'openai' }); res.end(); return; }
      } catch (err) {
        console.warn('[Orchestrator Stream] OpenAI failed:', (err as Error).message);
      }
    }

    // Try Claude streaming
    if (claudeService.isAvailable()) {
      try {
        sendChunk({ type: 'start', provider: 'claude' });

        for await (const chunk of claudeService.completeStream({
          domain: req.domain,
          question: req.question,
          computedData: req.context,
          ruleBasedInterpretation: ruleResult.content || undefined,
        })) {
          sendChunk({ type: 'delta', text: chunk });
        }

        sendChunk({ type: 'done', provider: 'claude' });
        res.end();
        return;
      } catch (err) {
        console.warn('[Orchestrator Stream] Claude stream failed:', (err as Error).message);
      }
    }

    // Fallback: send rule-based content chunked
    const fallback = ruleResult.content || 'Interpretation service unavailable. Please check your configuration.';
    sendChunk({ type: 'start', provider: 'rule-based' });

    // Simulate streaming for rule-based by sending in chunks
    const words = fallback.split(' ');
    const chunkSize = 10;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
      sendChunk({ type: 'delta', text: chunk });
    }

    sendChunk({ type: 'done', provider: 'rule-based' });
    res.end();
  }

  async getProviderStatus(): Promise<{
    ollama: { available: boolean; model: string; url: string };
    groq: { available: boolean; model: string };
    openai: { available: boolean; model: string };
    claude: { available: boolean; model: string };
    ruleBased: { available: boolean };
    activeProvider: LLMProvider;
  }> {
    const ollamaAvailable = await ollamaService.isHealthy().catch(() => false);
    const groqAvailable = !!(process.env.GROQ_API_KEY);
    const openaiAvailable = !!(process.env.OPENAI_API_KEY);
    const claudeAvailable = claudeService.isAvailable();

    const activeProvider: LLMProvider = ollamaAvailable ? 'ollama'
      : groqAvailable ? 'groq'
      : openaiAvailable ? 'openai'
      : claudeAvailable ? 'claude'
      : 'rule-based';

    return {
      ollama: { available: ollamaAvailable, model: ollamaService.getModel(), url: ollamaService.getBaseUrl() },
      groq: { available: groqAvailable, model: GROQ_MODEL },
      openai: { available: openaiAvailable, model: OPENAI_MODEL },
      claude: { available: claudeAvailable, model: claudeService.getModel() },
      ruleBased: { available: true },
      activeProvider,
    };
  }
}

export const llmOrchestrator = new LLMOrchestrator();
