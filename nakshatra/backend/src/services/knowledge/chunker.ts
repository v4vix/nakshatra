/**
 * Smart Text Chunker
 *
 * Splits documents into overlapping chunks for embedding while:
 *   - Respecting paragraph boundaries
 *   - Preserving Sanskrit/Devanagari verse blocks
 *   - Maintaining configurable size + overlap
 */

import { v4 as uuid } from 'uuid';
import { Chunk } from './types';

// ─── Config ─────────────────────────────────────────────────────────────────────

interface ChunkerConfig {
  /** Target chunk size in characters (~4 chars per token) */
  chunkSize: number;
  /** Overlap between consecutive chunks in characters */
  overlap: number;
  /** Source ID to associate chunks with */
  sourceId: string;
}

const DEFAULT_CONFIG: Omit<ChunkerConfig, 'sourceId'> = {
  chunkSize: 2048,   // ~512 tokens at ~4 chars/token
  overlap: 256,      // ~64 tokens overlap
};

// Devanagari Unicode range: U+0900 – U+097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

// ─── Main Chunker ───────────────────────────────────────────────────────────────

export function chunkText(
  text: string,
  sourceId: string,
  config?: Partial<Omit<ChunkerConfig, 'sourceId'>>,
): Chunk[] {
  const cfg: ChunkerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    sourceId,
  };

  if (!text.trim()) return [];

  // Step 1: Split into semantic blocks (paragraphs / verse blocks)
  const blocks = splitIntoBlocks(text);

  // Step 2: Merge blocks into chunks respecting size limits
  const chunks = mergeBlocksIntoChunks(blocks, cfg);

  return chunks;
}

// ─── Block Splitting ────────────────────────────────────────────────────────────

interface TextBlock {
  text: string;
  isSanskrit: boolean;
}

/**
 * Splits text into paragraph-level blocks.
 * Devanagari blocks are kept intact to preserve verse structure.
 */
function splitIntoBlocks(text: string): TextBlock[] {
  // Split on double newlines (paragraph boundaries)
  const rawBlocks = text.split(/\n\s*\n/);
  const blocks: TextBlock[] = [];

  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const isSanskrit = DEVANAGARI_REGEX.test(trimmed);
    blocks.push({ text: trimmed, isSanskrit });
  }

  return blocks;
}

// ─── Block → Chunk Merging ──────────────────────────────────────────────────────

function mergeBlocksIntoChunks(blocks: TextBlock[], cfg: ChunkerConfig): Chunk[] {
  const chunks: Chunk[] = [];
  let currentText = '';
  let currentContainsSanskrit = false;
  let position = 0;

  const flush = () => {
    if (!currentText.trim()) return;
    chunks.push({
      id: uuid(),
      text: currentText.trim(),
      sourceId: cfg.sourceId,
      metadata: {
        position,
        containsSanskrit: currentContainsSanskrit,
        totalChunks: 0, // will be filled in after all chunks are created
      },
    });
    position++;
    currentContainsSanskrit = false;
  };

  for (const block of blocks) {
    // If adding this block would exceed chunk size, flush current
    const combined = currentText
      ? `${currentText}\n\n${block.text}`
      : block.text;

    if (combined.length > cfg.chunkSize && currentText) {
      flush();

      // Apply overlap: keep the tail of the previous chunk
      if (cfg.overlap > 0 && currentText.length > 0) {
        // Find a paragraph boundary within the overlap region
        const overlapText = chunks[chunks.length - 1]?.text || '';
        const tail = overlapText.slice(-cfg.overlap);
        const paragraphBreak = tail.indexOf('\n\n');
        currentText = paragraphBreak >= 0
          ? tail.slice(paragraphBreak + 2)
          : tail;
      } else {
        currentText = '';
      }
    }

    // If a single block exceeds chunk size, force-split it
    if (block.text.length > cfg.chunkSize) {
      if (currentText) flush();
      const subChunks = forceSplitLargeBlock(block.text, cfg);
      for (const sub of subChunks) {
        currentText = sub;
        currentContainsSanskrit = currentContainsSanskrit || block.isSanskrit;
        flush();
      }
      currentText = '';
      continue;
    }

    currentText = currentText
      ? `${currentText}\n\n${block.text}`
      : block.text;

    if (block.isSanskrit) {
      currentContainsSanskrit = true;
    }
  }

  // Flush remainder
  flush();

  // Back-fill totalChunks
  const total = chunks.length;
  for (const chunk of chunks) {
    chunk.metadata.totalChunks = total;
  }

  return chunks;
}

/**
 * Force-splits a block that exceeds chunk size, trying to break at sentence boundaries.
 */
function forceSplitLargeBlock(text: string, cfg: ChunkerConfig): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > cfg.chunkSize) {
    let splitIdx = cfg.chunkSize;

    // Try to find a sentence boundary (period/question mark/exclamation followed by space)
    const searchRegion = remaining.slice(
      Math.floor(cfg.chunkSize * 0.7),
      cfg.chunkSize,
    );
    const sentenceEnd = searchRegion.search(/[.!?।॥]\s/);
    if (sentenceEnd >= 0) {
      splitIdx = Math.floor(cfg.chunkSize * 0.7) + sentenceEnd + 2;
    }

    parts.push(remaining.slice(0, splitIdx).trim());

    // Apply overlap
    const overlapStart = Math.max(0, splitIdx - cfg.overlap);
    remaining = remaining.slice(overlapStart);
  }

  if (remaining.trim()) {
    parts.push(remaining.trim());
  }

  return parts;
}
