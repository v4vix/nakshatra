/**
 * TF-IDF Embedding Engine (Zero-Cost, No External API)
 *
 * Generates sparse vector embeddings from text using Term Frequency-Inverse
 * Document Frequency. Vectors are projected into a fixed 384-dimensional
 * space via deterministic hashing for consistent storage and fast cosine
 * similarity search.
 *
 * Why TF-IDF over a neural model?
 *   - Zero cost: no API keys, no GPU, no downloads
 *   - Deterministic: same text always produces same embedding
 *   - Good enough for domain-specific KB (Vedic astrology has distinctive vocabulary)
 *   - Fast: pure JS, sub-millisecond per document
 */

const VECTOR_DIM = 384;

// ─── Vocabulary ─────────────────────────────────────────────────────────────────

/**
 * Global vocabulary: maps terms to their document frequency (how many
 * documents each term appears in). Grows as documents are added.
 */
let documentFrequency: Map<string, number> = new Map();
let totalDocuments = 0;

// ─── Tokenisation ───────────────────────────────────────────────────────────────

/** Simple stop words for English + common Vedic transliteration noise */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
  'too', 'very', 'just', 'because', 'if', 'when', 'while', 'although',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we',
  'our', 'ours', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it',
  'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')   // keep alphanumeric + Devanagari
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// ─── Deterministic Hash → Dimension Index ───────────────────────────────────────

/**
 * FNV-1a hash mapped to a dimension index in [0, VECTOR_DIM).
 * Deterministic: same token always maps to same index.
 */
function hashToDimension(token: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, unsigned
  }
  return hash % VECTOR_DIM;
}

// ─── TF-IDF Computation ─────────────────────────────────────────────────────────

function computeTF(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  // Normalise by total token count
  const total = tokens.length || 1;
  for (const [k, v] of freq) {
    freq.set(k, v / total);
  }
  return freq;
}

function computeIDF(term: string): number {
  const df = documentFrequency.get(term) || 0;
  // Smooth IDF: log((N + 1) / (df + 1)) + 1
  return Math.log((totalDocuments + 1) / (df + 1)) + 1;
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Register a document's tokens into the global vocabulary (call once per chunk
 * when indexing, before calling `embed`).
 */
export function registerDocument(text: string): void {
  const tokens = tokenize(text);
  const uniqueTerms = new Set(tokens);
  totalDocuments++;
  for (const term of uniqueTerms) {
    documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
  }
}

/**
 * Produce a fixed-length (384-dim) embedding vector for the given text.
 * The vector is an L2-normalised sparse TF-IDF projection.
 */
export function embed(text: string): number[] {
  const tokens = tokenize(text);
  const tf = computeTF(tokens);
  const vector = new Float64Array(VECTOR_DIM);

  for (const [term, tfVal] of tf) {
    const idf = computeIDF(term);
    const tfidf = tfVal * idf;
    const dim = hashToDimension(term);
    vector[dim] += tfidf; // additive in case of hash collisions
  }

  // L2 normalise
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;
  const result: number[] = new Array(VECTOR_DIM);
  for (let i = 0; i < VECTOR_DIM; i++) {
    result[i] = vector[i] / norm;
  }

  return result;
}

/**
 * Cosine similarity between two L2-normalised vectors (i.e., dot product).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Reset the vocabulary (used when reloading from persistence).
 */
export function resetVocabulary(): void {
  documentFrequency = new Map();
  totalDocuments = 0;
}

/**
 * Export vocabulary state for persistence.
 */
export function exportVocabulary(): { df: Record<string, number>; totalDocs: number } {
  const df: Record<string, number> = {};
  for (const [k, v] of documentFrequency) {
    df[k] = v;
  }
  return { df, totalDocs: totalDocuments };
}

/**
 * Import vocabulary state from persistence.
 */
export function importVocabulary(state: { df: Record<string, number>; totalDocs: number }): void {
  documentFrequency = new Map(Object.entries(state.df));
  totalDocuments = state.totalDocs;
}
