import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeContext {
  domain: 'kundli' | 'tarot' | 'numerology' | 'vastu' | 'scripture' | 'general';
  question: string;
  computedData?: Record<string, unknown>;
  ruleBasedInterpretation?: string;
}

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

const SYSTEM_PROMPT = `You are Nakshatra, a deeply knowledgeable Vedic astrology and spiritual wisdom assistant. You have expert knowledge of:
- Jyotish (Vedic Astrology): grahas, rashis, nakshatras, bhavas, dashas, yogas, doshas
- Tarot: Major and Minor Arcana, spreads, symbolic interpretation
- Numerology: Pythagorean and Chaldean systems, life path, expression, soul urge numbers
- Vastu Shastra: directional energies, elements, remedies
- Sanskrit shlokas and Vedic scriptures: Upanishads, Bhagavad Gita, Vedas, Puranas

CRITICAL ANTI-HALLUCINATION RULES:
1. You will be provided with pre-computed, authoritative data for any chart calculations. Use ONLY this data — never invent planetary positions, degrees, or chart data.
2. If computed data is provided, your role is to INTERPRET and EXPAND on it with wisdom, not to recalculate.
3. When specific positions are given (e.g., "Sun at 15° Mesha"), trust this data completely.
4. If asked something outside your data, clearly state what data you have and what you cannot determine.
5. Never fabricate birth chart details, specific planetary degrees, or nakshatra positions that were not provided.
6. Spiritual guidance must be grounded in authentic classical sources, not New Age generalizations.
7. When quoting shlokas or scripture, be accurate. Do not misattribute or paraphrase as direct quotes.

RESPONSE STYLE:
- Warm, wise, and grounded in classical tradition
- Use Sanskrit terms with brief English explanations
- Be specific with the provided data; avoid vague generalities
- Structure responses clearly with relevant headings
- Conclude with practical, actionable spiritual guidance
- Keep responses focused — quality over length`;

export class ClaudeService {
  private client: Anthropic;
  private model: string = 'claude-haiku-3-5';
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.isConfigured = !!(apiKey && apiKey !== 'your_key_here');

    this.client = new Anthropic({
      apiKey: apiKey || 'placeholder',
    });
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  private buildUserMessage(context: ClaudeContext): string {
    const parts: string[] = [];

    parts.push(`Domain: ${context.domain}`);
    parts.push(`Question: ${context.question}`);

    if (context.computedData && Object.keys(context.computedData).length > 0) {
      parts.push('\n--- PRE-COMPUTED AUTHENTIC DATA (use this as ground truth) ---');
      parts.push(JSON.stringify(context.computedData, null, 2));
    }

    if (context.ruleBasedInterpretation) {
      parts.push('\n--- RULE-BASED INTERPRETATION (expand on this) ---');
      parts.push(context.ruleBasedInterpretation);
    }

    parts.push('\nPlease provide a comprehensive, wisdom-filled interpretation based on the above data.');

    return parts.join('\n');
  }

  async complete(context: ClaudeContext): Promise<ClaudeResponse> {
    if (!this.isConfigured) {
      throw new Error('Claude API key not configured');
    }

    const userMessage = this.buildUserMessage(context);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
      ],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude returned no text content');
    }

    return {
      content: textBlock.text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  async *completeStream(context: ClaudeContext): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured) {
      throw new Error('Claude API key not configured');
    }

    const userMessage = this.buildUserMessage(context);

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }

  getModel(): string {
    return this.model;
  }
}

export const claudeService = new ClaudeService();
