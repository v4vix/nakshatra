/**
 * Knowledge Base Engine — Public API
 *
 * Orchestrates the full RAG pipeline:
 *   Upload/Scrape → Parse → Chunk → Embed → Store → Search → Generate
 */

import { v4 as uuid } from 'uuid';
import { parsePDF, parseText, parseURL } from './parser';
import { chunkText } from './chunker';
import { embed, registerDocument } from './embeddings';
import * as vectorStore from './vectorStore';
import * as llm from './llm';
import { SEED_KNOWLEDGE } from './seedKnowledge';
import {
  Chunk,
  KnowledgeSource,
  OracleResponse,
  ScoredChunk,
  SourceType,
  VectorStoreStats,
} from './types';

// ─── Initialisation ─────────────────────────────────────────────────────────────

let initialized = false;

export async function initialize(): Promise<void> {
  if (initialized) return;

  const loaded = vectorStore.load();
  if (!loaded) {
    console.log('[KnowledgeBase] No persisted data. Seeding default knowledge...');
    await seedDefaultKnowledge();
  }

  initialized = true;
  console.log('[KnowledgeBase] Engine initialised.');
}

// ─── Document Ingestion ─────────────────────────────────────────────────────────

export async function ingestPDF(
  buffer: Buffer,
  filename?: string,
): Promise<KnowledgeSource> {
  const parsed = await parsePDF(buffer, filename);
  return ingestDocument(parsed.title, parsed.content, 'pdf', {
    ...parsed.metadata,
    fileSize: buffer.length,
    mimeType: 'application/pdf',
  });
}

export async function ingestText(
  text: string,
  filename?: string,
): Promise<KnowledgeSource> {
  const parsed = parseText(text, filename);
  return ingestDocument(parsed.title, parsed.content, 'text', parsed.metadata);
}

export async function ingestURL(url: string): Promise<KnowledgeSource> {
  const parsed = await parseURL(url);
  return ingestDocument(parsed.title, parsed.content, 'url', {
    ...parsed.metadata,
    url,
  });
}

async function ingestDocument(
  title: string,
  content: string,
  type: SourceType,
  metadata: Record<string, unknown>,
): Promise<KnowledgeSource> {
  const sourceId = uuid();
  const now = new Date().toISOString();

  // Chunk the document
  const chunks = chunkText(content, sourceId);

  if (chunks.length === 0) {
    throw new Error('Document produced no indexable chunks. It may be empty or contain only whitespace.');
  }

  // Register all chunks in the TF-IDF vocabulary
  for (const chunk of chunks) {
    registerDocument(chunk.text);
  }

  // Generate embeddings
  const embeddings = chunks.map((chunk) => embed(chunk.text));

  // Store
  const source: KnowledgeSource = {
    id: sourceId,
    type,
    metadata: {
      title,
      ...(metadata as any),
    },
    chunkCount: chunks.length,
    createdAt: now,
    updatedAt: now,
  };

  vectorStore.addSource(source);
  vectorStore.addChunks(chunks, embeddings);

  // Persist
  vectorStore.save();

  console.log(
    `[KnowledgeBase] Ingested "${title}" → ${chunks.length} chunks (${type})`,
  );

  return source;
}

// ─── Seed Knowledge ─────────────────────────────────────────────────────────────

export async function seedDefaultKnowledge(): Promise<KnowledgeSource> {
  const sourceId = uuid();
  const now = new Date().toISOString();

  const chunks: Chunk[] = [];
  let position = 0;

  for (const entry of SEED_KNOWLEDGE) {
    const chunk: Chunk = {
      id: uuid(),
      text: entry.text,
      sourceId,
      metadata: {
        section: entry.section,
        position,
        containsSanskrit: /[\u0900-\u097F]/.test(entry.text),
        totalChunks: SEED_KNOWLEDGE.length,
      },
    };
    chunks.push(chunk);
    position++;
  }

  // Register in vocabulary
  for (const chunk of chunks) {
    registerDocument(chunk.text);
  }

  // Generate embeddings
  const embeddings = chunks.map((chunk) => embed(chunk.text));

  const source: KnowledgeSource = {
    id: sourceId,
    type: 'seed',
    metadata: {
      title: 'Nakshatra Built-in Vedic Knowledge',
    },
    chunkCount: chunks.length,
    createdAt: now,
    updatedAt: now,
  };

  vectorStore.addSource(source);
  vectorStore.addChunks(chunks, embeddings);
  vectorStore.save();

  console.log(
    `[KnowledgeBase] Seeded ${chunks.length} built-in knowledge chunks.`,
  );

  return source;
}

// ─── Search ─────────────────────────────────────────────────────────────────────

export function searchKnowledge(query: string, topK: number = 5): ScoredChunk[] {
  const queryEmbedding = embed(query);
  return vectorStore.search(queryEmbedding, topK);
}

// ─── Oracle (RAG Chat) ─────────────────────────────────────────────────────────

export async function* oracleChat(
  query: string,
  options?: { topK?: number; temperature?: number; maxTokens?: number },
): AsyncGenerator<{ text: string; provider: string; model: string; done: boolean }> {
  const topK = options?.topK ?? 5;

  // Step 1: Retrieve relevant context from knowledge base
  const results = searchKnowledge(query, topK);

  // Step 2: Build context string from top results
  const context = results
    .filter((r) => r.score > 0.05) // threshold to avoid noise
    .map((r, i) => {
      const source = vectorStore.getSource(r.chunk.sourceId);
      const title = source?.metadata.title || 'Unknown Source';
      return `[Source ${i + 1}: ${title}]\n${r.chunk.text}`;
    })
    .join('\n\n---\n\n');

  // Step 3: Stream LLM response
  yield* llm.generate(query, context, {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });
}

/**
 * Non-streaming oracle for simple use cases.
 */
export async function oracleChatSync(
  query: string,
  options?: { topK?: number; temperature?: number; maxTokens?: number },
): Promise<OracleResponse> {
  const topK = options?.topK ?? 5;
  const results = searchKnowledge(query, topK);

  const context = results
    .filter((r) => r.score > 0.05)
    .map((r, i) => {
      const source = vectorStore.getSource(r.chunk.sourceId);
      const title = source?.metadata.title || 'Unknown Source';
      return `[Source ${i + 1}: ${title}]\n${r.chunk.text}`;
    })
    .join('\n\n---\n\n');

  let fullText = '';
  let provider: string = 'rule-engine';
  let model: string = 'vedic-rules-v1';

  for await (const chunk of llm.generate(query, context, {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  })) {
    fullText += chunk.text;
    provider = chunk.provider;
    model = chunk.model;
  }

  return {
    answer: fullText,
    sources: results.slice(0, 3).map((r) => {
      const source = vectorStore.getSource(r.chunk.sourceId);
      return {
        sourceId: r.chunk.sourceId,
        title: source?.metadata.title || 'Unknown Source',
        snippet: r.chunk.text.slice(0, 200),
        score: r.score,
      };
    }),
    provider: provider as any,
    model,
  };
}

// ─── Source Management ──────────────────────────────────────────────────────────

export function getSources(): KnowledgeSource[] {
  return vectorStore.getSources();
}

export function removeSource(sourceId: string): boolean {
  const removed = vectorStore.removeSource(sourceId);
  if (removed) {
    vectorStore.save();
  }
  return removed;
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export function getStats(): VectorStoreStats {
  return vectorStore.getStats();
}

// ─── LLM Models ─────────────────────────────────────────────────────────────────

export async function listLLMModels() {
  return llm.listModels();
}
