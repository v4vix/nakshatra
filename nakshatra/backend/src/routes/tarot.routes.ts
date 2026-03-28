import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { ruleBasedEngine } from '../services/llm/RuleBasedEngine';
import { llmOrchestrator } from '../services/llm/LLMOrchestrator';

const router = Router();

// ─── Card Data ────────────────────────────────────────────────────────────────

const MAJOR_ARCANA_LIST = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
];

const MINOR_ARCANA_SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const MINOR_ARCANA_RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];

interface TarotCard {
  id: string;
  name: string;
  suit: string | null;
  arcana: 'major' | 'minor';
  number: number;
  element: string;
  keywords: string[];
}

function buildAllCards(): TarotCard[] {
  const cards: TarotCard[] = [];

  // Major Arcana
  MAJOR_ARCANA_LIST.forEach((name, i) => {
    const elementMap: Record<string, string> = {
      'The Fool': 'Air', 'The Magician': 'Air', 'The High Priestess': 'Water',
      'The Empress': 'Earth', 'The Emperor': 'Fire', 'The Hierophant': 'Earth',
      'The Lovers': 'Air', 'The Chariot': 'Water', 'Strength': 'Fire',
      'The Hermit': 'Earth', 'Wheel of Fortune': 'Fire', 'Justice': 'Air',
      'The Hanged Man': 'Water', 'Death': 'Water', 'Temperance': 'Fire',
      'The Devil': 'Earth', 'The Tower': 'Fire', 'The Star': 'Air',
      'The Moon': 'Water', 'The Sun': 'Fire', 'Judgement': 'Fire', 'The World': 'Earth',
    };
    cards.push({
      id: `major-${i}`,
      name,
      suit: null,
      arcana: 'major',
      number: i,
      element: elementMap[name] || 'Ether',
      keywords: [],
    });
  });

  // Minor Arcana
  const suitElements: Record<string, string> = {
    Wands: 'Fire', Cups: 'Water', Swords: 'Air', Pentacles: 'Earth',
  };

  MINOR_ARCANA_SUITS.forEach(suit => {
    MINOR_ARCANA_RANKS.forEach((rank, rankIdx) => {
      cards.push({
        id: `${suit.toLowerCase()}-${rank.toLowerCase()}`,
        name: `${rank} of ${suit}`,
        suit,
        arcana: 'minor',
        number: rankIdx + 1,
        element: suitElements[suit],
        keywords: [],
      });
    });
  });

  return cards;
}

const ALL_CARDS = buildAllCards();

// ─── In-memory reading store ──────────────────────────────────────────────────

interface SavedReading {
  id: string;
  spreadType: string;
  cards: Array<{ card: TarotCard; position: string; isReversed: boolean }>;
  question: string;
  interpretation: string;
  provider: string;
  createdAt: Date;
  sessionId?: string;
}

const readingStore: Map<string, SavedReading> = new Map();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const DrawSchema = z.object({
  count: z.number().int().min(1).max(10).default(3),
  spreadType: z.enum(['single', 'three-card', 'celtic-cross', 'five-card', 'custom']).optional().default('three-card'),
  allowReversed: z.boolean().optional().default(true),
  sessionId: z.string().optional(),
});

const ReadingSchema = z.object({
  cards: z.array(z.object({
    cardName: z.string(),
    position: z.string(),
    isReversed: z.boolean().optional().default(false),
  })).min(1).max(10),
  question: z.string().min(3).max(500),
  spreadType: z.string().optional().default('custom'),
  sessionId: z.string().optional(),
});

// ─── Spread position labels ───────────────────────────────────────────────────

const SPREAD_POSITIONS: Record<string, string[]> = {
  single: ['Present Situation'],
  'three-card': ['Past', 'Present', 'Future'],
  'five-card': ['Past', 'Present', 'Hidden Influences', 'Advice', 'Potential Outcome'],
  'celtic-cross': [
    'Present Situation',
    'Crossing Factor',
    'Foundation',
    'Recent Past',
    'Potential Future',
    'Near Future',
    'Self',
    'External Influences',
    'Hopes and Fears',
    'Outcome',
  ],
  custom: [],
};

/**
 * Fisher-Yates shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * GET /api/v1/tarot/cards
 * Return all 78 Tarot cards.
 */
router.get('/cards', (req: Request, res: Response) => {
  const { arcana, suit } = req.query;

  let cards = ALL_CARDS;
  if (arcana === 'major') cards = cards.filter(c => c.arcana === 'major');
  else if (arcana === 'minor') cards = cards.filter(c => c.arcana === 'minor');
  if (suit) cards = cards.filter(c => c.suit?.toLowerCase() === (suit as string).toLowerCase());

  res.json({ success: true, count: cards.length, cards });
});

/**
 * POST /api/v1/tarot/draw
 * Draw N cards from a shuffled deck.
 */
router.post('/draw', (req: Request, res: Response) => {
  const parseResult = DrawSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
  }

  const { count, spreadType, allowReversed } = parseResult.data;
  const shuffled = shuffle(ALL_CARDS);
  const drawn = shuffled.slice(0, count);

  const positions = SPREAD_POSITIONS[spreadType] || [];

  const drawnWithPositions = drawn.map((card, i) => ({
    card,
    position: positions[i] || `Card ${i + 1}`,
    isReversed: allowReversed ? Math.random() < 0.3 : false, // ~30% chance of reversal
  }));

  return res.json({
    success: true,
    spreadType,
    count: drawnWithPositions.length,
    cards: drawnWithPositions,
    positions: positions.length > 0 ? positions : null,
  });
});

/**
 * POST /api/v1/tarot/reading
 * Save a reading with AI interpretation.
 */
router.post('/reading', async (req: Request, res: Response) => {
  const parseResult = ReadingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
  }

  const { cards, question, spreadType, sessionId } = parseResult.data;

  // Build context for LLM
  const cardContext = cards.map(c => ({
    cardName: c.cardName,
    position: c.position,
    isReversed: c.isReversed,
    // Include rule-based interpretation for each card
    interpretation: ruleBasedEngine.interpretTarot(c.cardName, c.position, c.isReversed, question),
  }));

  const llmResult = await llmOrchestrator.process({
    domain: 'tarot',
    question,
    context: {
      spreadType,
      cards: cardContext,
      question,
    },
  }).catch(err => ({
    content: cardContext
      .map(c => `**${c.cardName}** (${c.position}${c.isReversed ? ' — Reversed' : ''}): ${c.interpretation.meaning}`)
      .join('\n\n'),
    provider: 'rule-based' as const,
    confidence: 0.7,
    streaming: false,
  }));

  // Find card data for each drawn card
  const cardsWithData = cards.map(c => {
    const cardData = ALL_CARDS.find(card => card.name === c.cardName);
    return {
      card: cardData || { name: c.cardName, id: c.cardName.toLowerCase().replace(/\s+/g, '-'), arcana: 'major' as const, suit: null, number: 0, element: 'Unknown', keywords: [] },
      position: c.position,
      isReversed: c.isReversed,
    };
  });

  const readingId = uuidv4();
  const reading: SavedReading = {
    id: readingId,
    spreadType: spreadType || 'custom',
    cards: cardsWithData,
    question,
    interpretation: llmResult.content,
    provider: llmResult.provider,
    createdAt: new Date(),
    sessionId,
  };

  readingStore.set(readingId, reading);

  return res.status(201).json({
    success: true,
    readingId,
    reading: {
      id: reading.id,
      question: reading.question,
      spreadType: reading.spreadType,
      cards: reading.cards,
      interpretation: reading.interpretation,
      provider: reading.provider,
      createdAt: reading.createdAt,
    },
  });
});

/**
 * GET /api/v1/tarot/reading/:id
 * Retrieve a saved reading by ID.
 */
router.get('/reading/:id', (req: Request, res: Response) => {
  const reading = readingStore.get(req.params.id);
  if (!reading) {
    return res.status(404).json({ error: 'Reading not found' });
  }
  return res.json({ success: true, reading });
});

/**
 * GET /api/v1/tarot/card/:name
 * Get a specific card by name with interpretation.
 */
router.get('/card/:name', (req: Request, res: Response) => {
  const cardName = decodeURIComponent(req.params.name);
  const card = ALL_CARDS.find(c => c.name.toLowerCase() === cardName.toLowerCase());

  if (!card) {
    return res.status(404).json({ error: `Card "${cardName}" not found` });
  }

  const uprightInterp = ruleBasedEngine.interpretTarot(card.name, 'general', false, '');
  const reversedInterp = ruleBasedEngine.interpretTarot(card.name, 'general', true, '');

  return res.json({
    success: true,
    card,
    interpretation: {
      upright: { meaning: uprightInterp.meaning, advice: uprightInterp.advice },
      reversed: { meaning: reversedInterp.meaning, advice: reversedInterp.advice },
    },
  });
});

export default router;
