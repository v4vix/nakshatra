/**
 * Authentic Vedic Source Scraper
 *
 * Respectful web scraper for public-domain Vedic texts.
 * - 2-second delay between requests
 * - Identifies itself via User-Agent
 * - Caches scraped content to avoid re-fetching
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseURL } from './parser';
import { ScrapedPage } from './types';

// ─── Config ─────────────────────────────────────────────────────────────────────

const CACHE_DIR = path.resolve(__dirname, '../../../data/scrape-cache');
const REQUEST_DELAY_MS = 2000;

/** Pre-configured authentic Vedic sources */
export const AUTHENTIC_SOURCES = [
  {
    name: 'Sacred Texts — Rig Veda Hymns',
    url: 'https://www.sacred-texts.com/hin/rigveda/',
    category: 'scripture',
  },
  {
    name: 'Sacred Texts — Bhagavad Gita',
    url: 'https://www.sacred-texts.com/hin/gita/',
    category: 'scripture',
  },
  {
    name: 'Sacred Texts — Upanishads',
    url: 'https://www.sacred-texts.com/hin/upan/',
    category: 'scripture',
  },
  {
    name: 'Wisdom Library — Jyotisha',
    url: 'https://www.wisdomlib.org/hinduism/concept/jyotisha',
    category: 'astrology',
  },
  {
    name: 'Wisdom Library — Nakshatra',
    url: 'https://www.wisdomlib.org/hinduism/concept/nakshatra',
    category: 'astrology',
  },
  {
    name: 'Wisdom Library — Vastu Shastra',
    url: 'https://www.wisdomlib.org/hinduism/concept/vastu-shastra',
    category: 'vastu',
  },
] as const;

// ─── Cache ──────────────────────────────────────────────────────────────────────

function getCacheKey(url: string): string {
  // Simple hash of URL for filename
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const chr = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `scrape_${Math.abs(hash).toString(36)}.json`;
}

function getCached(url: string): ScrapedPage | null {
  if (!fs.existsSync(CACHE_DIR)) return null;

  const cachePath = path.join(CACHE_DIR, getCacheKey(url));
  if (!fs.existsSync(cachePath)) return null;

  try {
    const raw = fs.readFileSync(cachePath, 'utf-8');
    const cached: ScrapedPage & { cachedAt: string } = JSON.parse(raw);

    // Cache valid for 7 days
    const age = Date.now() - new Date(cached.cachedAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) return null;

    return cached;
  } catch {
    return null;
  }
}

function setCache(url: string, page: ScrapedPage): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const cachePath = path.join(CACHE_DIR, getCacheKey(url));
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ ...page, cachedAt: new Date().toISOString() }),
    'utf-8',
  );
}

// ─── Scraper ────────────────────────────────────────────────────────────────────

/**
 * Scrape a single URL. Returns cached version if available.
 */
export async function scrapeSource(url: string): Promise<ScrapedPage> {
  // Check cache first
  const cached = getCached(url);
  if (cached) {
    console.log(`[Scraper] Cache hit for ${url}`);
    return cached;
  }

  console.log(`[Scraper] Fetching ${url} ...`);

  const parsed = await parseURL(url);

  const page: ScrapedPage = {
    title: parsed.title,
    content: parsed.content,
    url,
    scrapedAt: new Date().toISOString(),
  };

  setCache(url, page);
  return page;
}

/**
 * Scrape multiple URLs with respectful delay between requests.
 */
export async function scrapeMultiple(urls: string[]): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const page = await scrapeSource(urls[i]);
      results.push(page);
    } catch (err) {
      console.warn(`[Scraper] Failed to scrape ${urls[i]}:`, (err as Error).message);
    }

    // Respectful delay between requests (skip for cached)
    if (i < urls.length - 1) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return results;
}

/**
 * Get list of pre-configured authentic sources.
 */
export function getAuthenticSources() {
  return AUTHENTIC_SOURCES;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
