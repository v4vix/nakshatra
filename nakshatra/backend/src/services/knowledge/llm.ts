/**
 * LLM Waterfall — Ollama → Groq (Free) → Rule-Based Fallback
 *
 * Tries each provider in sequence. If a provider is unavailable or errors out,
 * falls through to the next. Supports streaming via async generators.
 */

import axios from 'axios';
import { LLMModel, LLMProvider } from './types';

// ─── Config ─────────────────────────────────────────────────────────────────────

const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE = 'https://api.groq.com/openai/v1';

const SYSTEM_PROMPT = `You are the Cosmic Oracle of Nakshatra, an expert in Vedic astrology (Jyotisha), Tarot, Numerology, Vastu Shastra, and Hindu scriptures. You draw upon the Brihat Parashara Hora Shastra, Jataka Parijata, Saravali, Phaladeepika, the Bhagavad Gita, Upanishads, and the Vedas.

When answering questions:
1. Ground your response in the provided CONTEXT passages from the knowledge base.
2. Cite specific texts, verses, or concepts when possible.
3. Use Sanskrit terms with English explanations in parentheses.
4. Be respectful of the sacred nature of these teachings.
5. If the context doesn't contain relevant information, say so honestly and share general Vedic wisdom.
6. Keep responses focused and insightful, typically 2-4 paragraphs.
7. Never fabricate scripture references.`;

// ─── Provider Detection ─────────────────────────────────────────────────────────

async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: 3000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function getOllamaModels(): Promise<string[]> {
  try {
    const res = await axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: 3000 });
    return (res.data.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}

function isGroqAvailable(): boolean {
  return GROQ_API_KEY.length > 0;
}

// ─── Streaming Generation ───────────────────────────────────────────────────────

/**
 * Generate a response using the LLM waterfall.
 * Yields text chunks as they arrive (streaming).
 */
export async function* generate(
  query: string,
  context: string,
  options?: { temperature?: number; maxTokens?: number },
): AsyncGenerator<{ text: string; provider: LLMProvider; model: string; done: boolean }> {
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 1024;

  const fullPrompt = buildPrompt(query, context);

  // ── Try Ollama ──
  if (await isOllamaAvailable()) {
    const models = await getOllamaModels();
    // Prefer these models in order
    const preferred = ['llama3.2', 'llama3.1', 'llama3', 'llama2', 'mistral', 'gemma2', 'phi3'];
    const model = preferred.find((p) => models.some((m) => m.startsWith(p))) || models[0];

    if (model) {
      try {
        yield* streamOllama(fullPrompt, model, temperature, maxTokens);
        return;
      } catch (err) {
        console.warn('[LLM] Ollama streaming failed, falling through:', (err as Error).message);
      }
    }
  }

  // ── Try Groq ──
  if (isGroqAvailable()) {
    try {
      yield* streamGroq(fullPrompt, temperature, maxTokens);
      return;
    } catch (err) {
      console.warn('[LLM] Groq streaming failed, falling through:', (err as Error).message);
    }
  }

  // ── Rule-Based Fallback ──
  yield* ruleBasedFallback(query, context);
}

// ─── Ollama Streaming ───────────────────────────────────────────────────────────

async function* streamOllama(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number,
): AsyncGenerator<{ text: string; provider: LLMProvider; model: string; done: boolean }> {
  const response = await axios.post(
    `${OLLAMA_BASE}/api/generate`,
    {
      model,
      prompt,
      stream: true,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    },
    {
      responseType: 'stream',
      timeout: 60_000,
    },
  );

  let buffer = '';
  for await (const rawChunk of response.data) {
    buffer += rawChunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          yield {
            text: parsed.response,
            provider: 'ollama',
            model,
            done: parsed.done || false,
          };
        }
        if (parsed.done) return;
      } catch {
        // Partial JSON, continue
      }
    }
  }
}

// ─── Groq Streaming ─────────────────────────────────────────────────────────────

async function* streamGroq(
  prompt: string,
  temperature: number,
  maxTokens: number,
): AsyncGenerator<{ text: string; provider: LLMProvider; model: string; done: boolean }> {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Free tier model

  const response = await axios.post(
    `${GROQ_BASE}/chat/completions`,
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
      timeout: 30_000,
    },
  );

  let buffer = '';
  for await (const rawChunk of response.data) {
    buffer += rawChunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') {
        yield { text: '', provider: 'groq', model, done: true };
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          yield { text: delta, provider: 'groq', model, done: false };
        }
      } catch {
        // Partial JSON
      }
    }
  }
}

// ─── Rule-Based Fallback ────────────────────────────────────────────────────────

async function* ruleBasedFallback(
  query: string,
  context: string,
): AsyncGenerator<{ text: string; provider: LLMProvider; model: string; done: boolean }> {
  const words = query.toLowerCase();

  let answer: string;

  if (words.includes('tat tvam asi') || words.includes('tattvamasi')) {
    answer = `"Tat Tvam Asi" (तत् त्वम् असि) — "Thou Art That" — is one of the four Mahavakyas (Great Sayings) from the Upanishads. It appears in the Chandogya Upanishad (6.8.7), where the sage Uddalaka Aruni teaches his son Shvetaketu the fundamental identity of the individual self (Atman) with the universal reality (Brahman). This teaching is central to Advaita Vedanta philosophy — the non-dual understanding that the essence of every being is identical with the Absolute. It is not merely an intellectual concept but a direct pointer to self-realization.`;
  } else if (words.includes('9 of swords') || words.includes('nine of swords')) {
    answer = `The Nine of Swords represents anxiety, worry, nightmares, and mental anguish. The card depicts a figure sitting up in bed, head in hands, with nine swords mounted on the wall behind them. Upright, it signifies overwhelming stress, guilt, or fear — often the worst of the suffering is self-created through rumination. The card asks you to examine whether your fears are based in reality or amplified by the mind. Reversed, it suggests the beginning of recovery, releasing guilt, and finding hope after a dark period. In Vedic terms, this aligns with the concept of "Chitta Vritti" — mental fluctuations that create suffering.`;
  } else if (context.trim().length > 50) {
    answer = `Based on Vedic wisdom:\n\n${
      context.slice(0, 1500)
    }\n\nThis insight is drawn from authentic Vedic sources in the Nakshatra knowledge base.`;
  } else if (words.includes('nakshatra')) {
    answer = `The 27 Nakshatras are the lunar mansions of Vedic astrology, each spanning 13°20' of the zodiac. They reveal the deeper psychological and spiritual nature of an individual. Each Nakshatra has a ruling deity (Devata), a planetary lord (Graha), and a symbol (Pratika) that encode its essential nature. To explore a specific Nakshatra, please provide its name or the Moon's degree in the birth chart.`;
  } else if (words.includes('rashi') || words.includes('zodiac') || words.includes('sign')) {
    answer = `The 12 Rashis (zodiac signs) in Vedic astrology are sidereal, meaning they are aligned with the actual star constellations rather than the tropical seasons. Each Rashi is ruled by a specific Graha (planet) and has unique characteristics related to elements (Tattva), qualities (Guna), and nature (Svabhava). The sidereal zodiac differs from the Western tropical zodiac by approximately 23-24 degrees (the Ayanamsha).`;
  } else if (words.includes('dasha') || words.includes('period')) {
    answer = `The Vimshottari Dasha system is the most widely used planetary period system in Vedic astrology. It spans a 120-year cycle, with each of the 9 Grahas ruling a specific period: Sun (6 years), Moon (10), Mars (7), Rahu (18), Jupiter (16), Saturn (19), Mercury (17), Ketu (7), Venus (20). The starting Dasha is determined by the Moon's Nakshatra at birth.`;
  } else if (words.includes('compatibility') || words.includes('matching')) {
    answer = `Vedic compatibility analysis primarily uses the Ashtakoot (eight-fold) matching system based on the Moon's Nakshatra. The eight factors are: Varna (1 point), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8), totalling 36 points. A score of 18+ is generally considered favourable for marriage.`;
  } else {
    answer = `Thank you for your question. The Nakshatra knowledge base covers Nakshatras, Rashis, Grahas, Dasha systems, compatibility (Ashtakoot), Panchanga, Vastu Shastra, Tarot, Numerology, and sacred scriptures including the Bhagavad Gita, Upanishads, and Vedas. Could you provide more specific details about what aspect of Vedic wisdom you'd like to explore? For example, you could ask about a specific Nakshatra, planet placement, yoga, or spiritual concept.`;
  }

  // Simulate streaming by yielding word by word
  const words2 = answer.split(' ');
  for (let i = 0; i < words2.length; i++) {
    const space = i === 0 ? '' : ' ';
    yield {
      text: space + words2[i],
      provider: 'rule-engine',
      model: 'vedic-rules-v1',
      done: i === words2.length - 1,
    };
  }
}

// ─── Model Listing ──────────────────────────────────────────────────────────────

export async function listModels(): Promise<LLMModel[]> {
  const models: LLMModel[] = [];

  // Ollama models
  const ollamaModels = await getOllamaModels();
  for (const m of ollamaModels) {
    models.push({
      id: `ollama:${m}`,
      name: m,
      provider: 'ollama',
      available: true,
    });
  }

  // Groq
  if (isGroqAvailable()) {
    models.push({
      id: 'groq:llama-3.3-70b-versatile',
      name: 'LLaMA 3.3 70B (Groq)',
      provider: 'groq',
      available: true,
    });
  }

  // Rule engine is always available
  models.push({
    id: 'rule-engine:vedic-rules-v1',
    name: 'Vedic Rule Engine (Fallback)',
    provider: 'rule-engine',
    available: true,
  });

  return models;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function buildPrompt(query: string, context: string): string {
  if (context.trim()) {
    return `${SYSTEM_PROMPT}

CONTEXT (from Vedic knowledge base):
---
${context}
---

USER QUESTION: ${query}

Provide a thoughtful, grounded answer based on the CONTEXT above. Cite specific sources when possible.`;
  }

  return `${SYSTEM_PROMPT}

USER QUESTION: ${query}

Provide a thoughtful answer drawing upon your knowledge of Vedic astrology and scriptures.`;
}
