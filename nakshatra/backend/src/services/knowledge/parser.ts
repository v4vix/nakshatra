/**
 * Document Parser
 *
 * Extracts structured text from various document formats:
 *   - PDF  → pdf-parse
 *   - TXT  → passthrough
 *   - URL  → cheerio HTML extraction
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { ParsedDocument } from './types';

// ─── PDF Parser ─────────────────────────────────────────────────────────────────

export async function parsePDF(buffer: Buffer, filename?: string): Promise<ParsedDocument> {
  // Dynamic import because pdf-parse has side effects at require-time
  const pdfParse = (await import('pdf-parse')).default;

  const data = await pdfParse(buffer, {
    // Limit to reasonable page count to prevent abuse
    max: 500,
  });

  const title = data.info?.Title || filename?.replace(/\.pdf$/i, '') || 'Untitled PDF';

  return {
    title,
    content: cleanText(data.text),
    metadata: {
      pageCount: data.numpages,
      author: data.info?.Author || undefined,
      creator: data.info?.Creator || undefined,
    },
  };
}

// ─── Plain Text Parser ──────────────────────────────────────────────────────────

export function parseText(text: string, filename?: string): ParsedDocument {
  const lines = text.trim().split('\n');
  // Use first non-empty line as title, fallback to filename
  const title = lines.find((l) => l.trim().length > 0)?.trim().slice(0, 120) ||
    filename?.replace(/\.txt$/i, '') ||
    'Untitled Text';

  return {
    title,
    content: cleanText(text),
    metadata: {
      charCount: text.length,
      lineCount: lines.length,
    },
  };
}

// ─── URL/Web Parser ─────────────────────────────────────────────────────────────

export async function parseURL(url: string): Promise<ParsedDocument> {
  const response = await axios.get(url, {
    timeout: 15_000,
    maxContentLength: 5 * 1024 * 1024, // 5 MB max
    headers: {
      'User-Agent': 'NakshatraKnowledgeBot/1.0 (+vedic-astrology-research)',
      Accept: 'text/html,application/xhtml+xml,text/plain',
    },
  });

  const contentType = response.headers['content-type'] || '';

  if (contentType.includes('text/plain')) {
    return parseText(response.data, url);
  }

  const $ = cheerio.load(response.data);

  // Remove noise elements
  $('script, style, nav, footer, header, aside, iframe, noscript, .ads, .sidebar, .menu, .cookie-banner').remove();

  // Try to find main article content
  const articleSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-body',
    '.entry-content',
    '.content',
    '#content',
    '#mw-content-text', // Wikipedia
    '.mw-parser-output',
  ];

  let content = '';
  for (const selector of articleSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      content = el.text();
      break;
    }
  }

  // Fallback to body text
  if (!content.trim()) {
    content = $('body').text();
  }

  const title = $('title').text().trim() ||
    $('h1').first().text().trim() ||
    new URL(url).hostname;

  return {
    title: title.slice(0, 200),
    content: cleanText(content),
    metadata: {
      url,
      scrapedAt: new Date().toISOString(),
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Normalises whitespace, removes null bytes, and collapses blank lines.
 */
function cleanText(raw: string): string {
  return raw
    .replace(/\0/g, '')                     // null bytes
    .replace(/\r\n/g, '\n')                 // normalise line endings
    .replace(/\t/g, ' ')                    // tabs → spaces
    .replace(/ {2,}/g, ' ')                 // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')             // max 2 consecutive newlines
    .trim();
}
