/**
 * Knowledge Base Engine — Type Definitions
 *
 * Canonical types for the RAG (Retrieval-Augmented Generation) pipeline:
 *   Source → Chunk → Embedding → VectorStore → Search → LLM
 */

// ─── Source Types ───────────────────────────────────────────────────────────────

export type SourceType = 'pdf' | 'text' | 'url' | 'seed';

export interface SourceMetadata {
  title: string;
  author?: string;
  url?: string;
  fileSize?: number;
  mimeType?: string;
  scrapedAt?: string;
  pageCount?: number;
}

export interface KnowledgeSource {
  id: string;
  type: SourceType;
  metadata: SourceMetadata;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Chunk Types ────────────────────────────────────────────────────────────────

export interface ChunkMetadata {
  /** Which section/heading this chunk belongs to */
  section?: string;
  /** 0-indexed position in original document */
  position: number;
  /** Whether this chunk contains Devanagari/Sanskrit text */
  containsSanskrit: boolean;
  /** Total chunks in the source */
  totalChunks: number;
}

export interface Chunk {
  id: string;
  text: string;
  sourceId: string;
  metadata: ChunkMetadata;
}

// ─── Embedding & Search Types ───────────────────────────────────────────────────

export interface EmbeddedChunk {
  chunk: Chunk;
  embedding: number[];
}

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
}

// ─── Vector Store Types ─────────────────────────────────────────────────────────

export interface VectorStoreSnapshot {
  version: number;
  createdAt: string;
  updatedAt: string;
  sources: KnowledgeSource[];
  entries: Array<{
    chunk: Chunk;
    embedding: number[];
  }>;
}

export interface VectorStoreStats {
  totalChunks: number;
  totalSources: number;
  sourceBreakdown: Record<SourceType, number>;
  estimatedSizeBytes: number;
  lastUpdated: string | null;
}

// ─── LLM Types ──────────────────────────────────────────────────────────────────

export type LLMProvider = 'ollama' | 'groq' | 'openai' | 'anthropic' | 'rule-engine';

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  available: boolean;
}

export interface OracleRequest {
  query: string;
  topK?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface OracleResponse {
  answer: string;
  sources: Array<{
    sourceId: string;
    title: string;
    snippet: string;
    score: number;
  }>;
  provider: LLMProvider;
  model: string;
}

// ─── Parser Types ───────────────────────────────────────────────────────────────

export interface ParsedDocument {
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

// ─── Scraper Types ──────────────────────────────────────────────────────────────

export interface ScrapedPage {
  title: string;
  content: string;
  url: string;
  scrapedAt: string;
}
