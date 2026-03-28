import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-define the schemas locally to test them in isolation without importing
// route modules that pull in heavy service dependencies.
// These mirror the schemas in llm.routes.ts and oracle.routes.ts exactly.

const InterpretSchema = z.object({
  domain: z.enum(['kundli', 'tarot', 'numerology', 'vastu', 'scripture', 'general']),
  question: z.string().min(3).max(1000),
  context: z.record(z.unknown()).optional().default({}),
  sessionId: z.string().optional(),
});

const ChatSchema = z.object({
  query: z.string().min(1, 'Query must not be empty').max(2000, 'Query too long'),
  topK: z.number().int().min(1).max(20).optional().default(5),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().min(50).max(4096).optional().default(1024),
  stream: z.boolean().optional().default(true),
});

// ─── LLM InterpretSchema ────────────────────────────────────────────────────

describe('LLM InterpretSchema', () => {
  it('should accept valid input with all fields', () => {
    const result = InterpretSchema.safeParse({
      domain: 'kundli',
      question: 'What does my chart say?',
      context: { birthDate: '1990-01-01' },
      sessionId: 'abc-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.domain).toBe('kundli');
      expect(result.data.question).toBe('What does my chart say?');
      expect(result.data.context).toEqual({ birthDate: '1990-01-01' });
    }
  });

  it('should accept valid input with only required fields', () => {
    const result = InterpretSchema.safeParse({
      domain: 'tarot',
      question: 'Tell me about love',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toEqual({});
      expect(result.data.sessionId).toBeUndefined();
    }
  });

  it('should reject invalid domain', () => {
    const result = InterpretSchema.safeParse({
      domain: 'astrology',
      question: 'What is my sign?',
    });

    expect(result.success).toBe(false);
  });

  it('should reject question shorter than 3 characters', () => {
    const result = InterpretSchema.safeParse({
      domain: 'general',
      question: 'Hi',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors;
      expect(issues.question).toBeDefined();
    }
  });

  it('should reject question longer than 1000 characters', () => {
    const result = InterpretSchema.safeParse({
      domain: 'general',
      question: 'a'.repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing domain', () => {
    const result = InterpretSchema.safeParse({
      question: 'What is vastu?',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing question', () => {
    const result = InterpretSchema.safeParse({
      domain: 'vastu',
    });

    expect(result.success).toBe(false);
  });

  it('should accept all valid domain values', () => {
    const domains = ['kundli', 'tarot', 'numerology', 'vastu', 'scripture', 'general'];
    for (const domain of domains) {
      const result = InterpretSchema.safeParse({ domain, question: 'test question' });
      expect(result.success).toBe(true);
    }
  });
});

// ─── Oracle ChatSchema ──────────────────────────────────────────────────────

describe('Oracle ChatSchema', () => {
  it('should accept valid input with all fields', () => {
    const result = ChatSchema.safeParse({
      query: 'Tell me about karma',
      topK: 10,
      temperature: 1.0,
      maxTokens: 2048,
      stream: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe('Tell me about karma');
      expect(result.data.topK).toBe(10);
      expect(result.data.stream).toBe(false);
    }
  });

  it('should apply defaults for optional fields', () => {
    const result = ChatSchema.safeParse({
      query: 'What is dharma?',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topK).toBe(5);
      expect(result.data.temperature).toBe(0.7);
      expect(result.data.maxTokens).toBe(1024);
      expect(result.data.stream).toBe(true);
    }
  });

  it('should reject empty query', () => {
    const result = ChatSchema.safeParse({
      query: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject query longer than 2000 characters', () => {
    const result = ChatSchema.safeParse({
      query: 'x'.repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  it('should reject topK outside valid range', () => {
    const tooLow = ChatSchema.safeParse({ query: 'test', topK: 0 });
    const tooHigh = ChatSchema.safeParse({ query: 'test', topK: 21 });

    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('should reject non-integer topK', () => {
    const result = ChatSchema.safeParse({ query: 'test', topK: 3.5 });

    expect(result.success).toBe(false);
  });

  it('should reject temperature outside valid range', () => {
    const tooLow = ChatSchema.safeParse({ query: 'test', temperature: -0.1 });
    const tooHigh = ChatSchema.safeParse({ query: 'test', temperature: 2.1 });

    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('should reject maxTokens outside valid range', () => {
    const tooLow = ChatSchema.safeParse({ query: 'test', maxTokens: 49 });
    const tooHigh = ChatSchema.safeParse({ query: 'test', maxTokens: 4097 });

    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('should reject missing query', () => {
    const result = ChatSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
