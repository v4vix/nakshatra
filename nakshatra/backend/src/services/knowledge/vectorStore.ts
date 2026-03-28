/**
 * In-Memory Vector Store with JSON File Persistence
 *
 * Stores embedded chunks and supports cosine similarity search.
 * Persistence layer writes to /backend/data/vectors.json.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Chunk,
  EmbeddedChunk,
  KnowledgeSource,
  ScoredChunk,
  SourceType,
  VectorStoreSnapshot,
  VectorStoreStats,
} from './types';
import {
  cosineSimilarity,
  exportVocabulary,
  importVocabulary,
  resetVocabulary,
} from './embeddings';

// ─── Config ─────────────────────────────────────────────────────────────────────

const DATA_DIR = path.resolve(__dirname, '../../../data');
const VECTORS_PATH = path.join(DATA_DIR, 'vectors.json');
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json');
const SNAPSHOT_VERSION = 1;

// ─── Store State ────────────────────────────────────────────────────────────────

let entries: EmbeddedChunk[] = [];
let sources: Map<string, KnowledgeSource> = new Map();
let lastUpdated: string | null = null;

// ─── CRUD Operations ────────────────────────────────────────────────────────────

/**
 * Add chunks with their embeddings to the store.
 */
export function addChunks(chunks: Chunk[], embeddings: number[][]): void {
  if (chunks.length !== embeddings.length) {
    throw new Error(
      `Chunk/embedding count mismatch: ${chunks.length} chunks vs ${embeddings.length} embeddings`,
    );
  }

  for (let i = 0; i < chunks.length; i++) {
    entries.push({
      chunk: chunks[i],
      embedding: embeddings[i],
    });
  }

  lastUpdated = new Date().toISOString();
}

/**
 * Register a knowledge source (metadata about where chunks came from).
 */
export function addSource(source: KnowledgeSource): void {
  sources.set(source.id, source);
}

/**
 * Remove a source and all its chunks.
 */
export function removeSource(sourceId: string): boolean {
  const existed = sources.delete(sourceId);
  if (existed) {
    entries = entries.filter((e) => e.chunk.sourceId !== sourceId);
    lastUpdated = new Date().toISOString();
  }
  return existed;
}

/**
 * Get all registered sources.
 */
export function getSources(): KnowledgeSource[] {
  return Array.from(sources.values());
}

/**
 * Get a single source by ID.
 */
export function getSource(sourceId: string): KnowledgeSource | undefined {
  return sources.get(sourceId);
}

// ─── Search ─────────────────────────────────────────────────────────────────────

/**
 * Search for the top-K most similar chunks to the query embedding.
 */
export function search(queryEmbedding: number[], topK: number = 5): ScoredChunk[] {
  if (entries.length === 0) return [];

  const scored: ScoredChunk[] = entries.map((entry) => ({
    chunk: entry.chunk,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export function getStats(): VectorStoreStats {
  const sourceBreakdown: Record<SourceType, number> = {
    pdf: 0,
    text: 0,
    url: 0,
    seed: 0,
  };

  for (const source of sources.values()) {
    sourceBreakdown[source.type] = (sourceBreakdown[source.type] || 0) + 1;
  }

  // Rough size estimate: each entry has ~384 floats (8 bytes each) + chunk text
  const embeddingBytes = entries.length * 384 * 8;
  const textBytes = entries.reduce((sum, e) => sum + e.chunk.text.length * 2, 0);

  return {
    totalChunks: entries.length,
    totalSources: sources.size,
    sourceBreakdown,
    estimatedSizeBytes: embeddingBytes + textBytes,
    lastUpdated,
  };
}

// ─── Persistence ────────────────────────────────────────────────────────────────

/**
 * Save the entire store to disk as JSON.
 */
export function save(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const snapshot: VectorStoreSnapshot = {
    version: SNAPSHOT_VERSION,
    createdAt: lastUpdated || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sources: Array.from(sources.values()),
    entries: entries.map((e) => ({
      chunk: e.chunk,
      embedding: e.embedding,
    })),
  };

  fs.writeFileSync(VECTORS_PATH, JSON.stringify(snapshot), 'utf-8');

  // Also persist vocabulary
  const vocab = exportVocabulary();
  fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab), 'utf-8');

  console.log(
    `[VectorStore] Saved ${entries.length} chunks from ${sources.size} sources to disk.`,
  );
}

/**
 * Load the store from disk. Returns false if no file exists.
 */
export function load(): boolean {
  if (!fs.existsSync(VECTORS_PATH)) {
    console.log('[VectorStore] No persisted data found. Starting fresh.');
    return false;
  }

  try {
    const raw = fs.readFileSync(VECTORS_PATH, 'utf-8');
    const snapshot: VectorStoreSnapshot = JSON.parse(raw);

    if (snapshot.version !== SNAPSHOT_VERSION) {
      console.warn(
        `[VectorStore] Version mismatch (file: ${snapshot.version}, expected: ${SNAPSHOT_VERSION}). Starting fresh.`,
      );
      return false;
    }

    // Restore sources
    sources = new Map();
    for (const src of snapshot.sources) {
      sources.set(src.id, src);
    }

    // Restore entries
    entries = snapshot.entries.map((e) => ({
      chunk: e.chunk,
      embedding: e.embedding,
    }));

    lastUpdated = snapshot.updatedAt;

    // Restore vocabulary
    if (fs.existsSync(VOCAB_PATH)) {
      const vocabRaw = fs.readFileSync(VOCAB_PATH, 'utf-8');
      const vocab = JSON.parse(vocabRaw);
      importVocabulary(vocab);
    }

    console.log(
      `[VectorStore] Loaded ${entries.length} chunks from ${sources.size} sources.`,
    );
    return true;
  } catch (err) {
    console.error('[VectorStore] Failed to load persisted data:', err);
    return false;
  }
}

/**
 * Clear all data (useful for testing).
 */
export function clear(): void {
  entries = [];
  sources = new Map();
  lastUpdated = null;
  resetVocabulary();
}
