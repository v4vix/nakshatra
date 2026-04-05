import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ruleBasedEngine } from '../services/llm/RuleBasedEngine';
import { llmOrchestrator } from '../services/llm/LLMOrchestrator';

const router = Router();

// ─── Numerology Calculation Logic ─────────────────────────────────────────────

/**
 * Reduce a number to a single digit or master number (11, 22, 33).
 */
function reduceNumber(n: number): number {
  if ([11, 22, 33].includes(n)) return n;
  if (n < 10) return n;
  const sum = String(n).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Life Path Number from date of birth.
 * Method: Reduce month, day, and year separately, then add and reduce.
 */
function calculateLifePath(dob: string): number {
  // dob format: YYYY-MM-DD
  const [yearStr, monthStr, dayStr] = dob.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const reducedMonth = reduceNumber(month);
  const reducedDay = reduceNumber(day);

  // Reduce year digit by digit
  const yearSum = String(year).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const reducedYear = reduceNumber(yearSum);

  const total = reducedMonth + reducedDay + reducedYear;
  return reduceNumber(total);
}

/**
 * Pythagorean number chart for letters.
 */
const PYTHAGOREAN_CHART: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Calculate Expression Number (Destiny Number) from full name.
 * Uses Pythagorean system.
 */
function calculateExpression(fullName: string): number {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, '').split('');
  const sum = letters.reduce((acc, l) => acc + (PYTHAGOREAN_CHART[l] || 0), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Soul Urge Number (Heart's Desire) — vowels only.
 */
function calculateSoulUrge(fullName: string): number {
  const vowelLetters = fullName.toLowerCase().replace(/[^a-z]/g, '').split('').filter(l => VOWELS.has(l));
  const sum = vowelLetters.reduce((acc, l) => acc + (PYTHAGOREAN_CHART[l] || 0), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Personality Number — consonants only.
 */
function calculatePersonality(fullName: string): number {
  const consonants = fullName.toLowerCase().replace(/[^a-z]/g, '').split('').filter(l => !VOWELS.has(l));
  const sum = consonants.reduce((acc, l) => acc + (PYTHAGOREAN_CHART[l] || 0), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Birthday Number — just the day of birth.
 */
function calculateBirthdayNumber(dob: string): number {
  const day = parseInt(dob.split('-')[2], 10);
  return reduceNumber(day);
}

/**
 * Calculate Personal Year Number for a given calendar year.
 * Formula: reduce(birth_month + birth_day + target_year)
 */
function calculatePersonalYear(dob: string, year: number): number {
  const [, monthStr, dayStr] = dob.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const reducedMonth = reduceNumber(month);
  const reducedDay = reduceNumber(day);
  const reducedYear = reduceNumber(
    String(year).split('').reduce((acc, d) => acc + parseInt(d, 10), 0)
  );

  return reduceNumber(reducedMonth + reducedDay + reducedYear);
}

// ─── Number Meanings (beyond life path — these are for all numerology numbers) ─

const PERSONAL_YEAR_MEANINGS: Record<number, string> = {
  1: 'Personal Year 1 — New beginnings and fresh starts. A year to initiate, take bold action, and plant seeds for the next nine-year cycle. Independence and self-assertion are favored.',
  2: 'Personal Year 2 — Cooperation, patience, and relationships. A year of diplomacy, building connections, and waiting for seeds planted last year to take root. Intuition is heightened.',
  3: 'Personal Year 3 — Creativity, self-expression, and social expansion. Joy, communication, and artistic expression are themes. Scatter energy mindfully.',
  4: 'Personal Year 4 — Work, foundation-building, and discipline. A year to establish structures, work diligently, and create lasting stability. Results come through sustained effort.',
  5: 'Personal Year 5 — Change, freedom, and new experiences. Expect the unexpected. Travel, career shifts, and new perspectives characterize this dynamic year.',
  6: 'Personal Year 6 — Responsibility, family, and home. A year focused on relationships, nurturing others, and creating harmony in personal and professional environments.',
  7: 'Personal Year 7 — Reflection, wisdom-seeking, and inner development. A year for study, solitude, and spiritual development. Inner work yields profound insights.',
  8: 'Personal Year 8 — Manifestation, power, and financial focus. A year of harvest from past efforts. Business, finance, and career advancement are strongly supported.',
  9: 'Personal Year 9 — Completion, release, and preparation. A year to conclude cycles, release what no longer serves, and prepare for a new nine-year beginning. Compassion and service are highlighted.',
  11: 'Personal Year 11 — Spiritual illumination and inspiration. A master year of elevated intuition, spiritual experiences, and significant turning points. Very intense.',
  22: 'Personal Year 22 — Master builder energy. Grand visions can be realized through disciplined effort. A powerful year for manifesting large-scale contributions.',
};

const BIRTHDAY_NUMBER_MEANINGS: Record<number, string> = {
  1: 'Birthday Number 1: You possess natural leadership, originality, and independence. A pioneer spirit and strong sense of self drive you forward.',
  2: 'Birthday Number 2: Your gift is sensitivity, diplomacy, and the ability to bring peace to conflicting forces. You excel as a mediator.',
  3: 'Birthday Number 3: You have an innate talent for self-expression, creativity, and bringing joy to others through communication.',
  4: 'Birthday Number 4: Practicality, reliability, and the ability to build lasting structures are your natural gifts.',
  5: 'Birthday Number 5: Versatility, adaptability, and a love of freedom and new experiences define your essence.',
  6: 'Birthday Number 6: Nurturing, responsibility, and a deep sense of service to family and community are your natural calling.',
  7: 'Birthday Number 7: An analytical mind, love of knowledge, and depth of spiritual inquiry characterize your gift.',
  8: 'Birthday Number 8: Executive ability, material mastery, and the power to manifest abundance are your strengths.',
  9: 'Birthday Number 9: Compassion, wisdom, and humanitarian instincts mark you as one called to serve the greater good.',
};

// ─── Validation Schemas ───────────────────────────────────────────────────────

const CalculateSchema = z.object({
  fullName: z.string().min(1).max(200),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be YYYY-MM-DD'),
  targetYear: z.number().int().min(1900).max(2100).optional(),
  includeInterpretation: z.boolean().optional().default(false),
  question: z.string().optional(),
});

/**
 * POST /api/v1/numerology/calculate
 * Calculate all core numerology numbers for a person.
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const parseResult = CalculateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const { fullName, dateOfBirth, targetYear, includeInterpretation, question } = parseResult.data;
    const currentYear = targetYear || new Date().getFullYear();

    const lifePathNumber = calculateLifePath(dateOfBirth);
    const expressionNumber = calculateExpression(fullName);
    const soulUrgeNumber = calculateSoulUrge(fullName);
    const personalityNumber = calculatePersonality(fullName);
    const birthdayNumber = calculateBirthdayNumber(dateOfBirth);
    const personalYearNumber = calculatePersonalYear(dateOfBirth, currentYear);

    const result = {
      fullName,
      dateOfBirth,
      numbers: {
        lifePath: { value: lifePathNumber, label: 'Life Path Number' },
        expression: { value: expressionNumber, label: 'Expression / Destiny Number' },
        soulUrge: { value: soulUrgeNumber, label: 'Soul Urge / Heart\'s Desire Number' },
        personality: { value: personalityNumber, label: 'Personality Number' },
        birthday: { value: birthdayNumber, label: 'Birthday Number' },
        personalYear: { value: personalYearNumber, label: `Personal Year Number (${currentYear})` },
      },
      basicMeanings: {
        lifePath: ruleBasedEngine.interpretNumerology(lifePathNumber, expressionNumber).meaning,
        personalYear: PERSONAL_YEAR_MEANINGS[personalYearNumber] || `Personal Year ${personalYearNumber}: A year of focused ${personalYearNumber}-energy growth.`,
        birthday: BIRTHDAY_NUMBER_MEANINGS[birthdayNumber] || `Birthday ${birthdayNumber}: Your day of birth carries the vibration of the number ${birthdayNumber}.`,
      },
    };

    let interpretation;
    if (includeInterpretation) {
      const llmResult = await llmOrchestrator.process({
        domain: 'numerology',
        question: question || `Provide a comprehensive numerology reading for ${fullName}.`,
        context: {
          fullName,
          dateOfBirth,
          lifePathNumber,
          expressionNumber,
          soulUrgeNumber,
          personalityNumber,
          birthdayNumber,
          personalYearNumber,
          currentYear,
        },
      });
      interpretation = { content: llmResult.content, provider: llmResult.provider };
    }

    return res.json({
      success: true,
      ...result,
      ...(interpretation && { interpretation }),
    });
  } catch (err) {
    const error = err as Error;
    console.error('[NumerologyRoute] Error:', error.message);
    return res.status(500).json({ error: 'Numerology calculation failed', details: error.message });
  }
});

/**
 * GET /api/v1/numerology/meaning/:number
 * Get the meaning of a specific numerology number.
 */
router.get('/meaning/:number', (req: Request, res: Response) => {
  const num = parseInt(req.params.number, 10);

  if (isNaN(num) || num < 1 || num > 33) {
    return res.status(400).json({ error: 'Number must be between 1 and 33' });
  }

  const interpretation = ruleBasedEngine.interpretNumerology(num);

  return res.json({
    success: true,
    number: num,
    interpretation: {
      meaning: interpretation.meaning,
      traits: interpretation.traits,
      challenges: interpretation.challenges,
      advice: interpretation.advice,
    },
    personalYearMeaning: PERSONAL_YEAR_MEANINGS[num] || null,
    birthdayMeaning: BIRTHDAY_NUMBER_MEANINGS[num] || null,
  });
});

/**
 * POST /api/v1/numerology/compatibility
 * Calculate compatibility between two life path numbers.
 */
router.post('/compatibility', (req: Request, res: Response) => {
  const schema = z.object({
    lifePathA: z.number().int().min(1).max(33),
    lifePathB: z.number().int().min(1).max(33),
  });

  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
  }

  const { lifePathA, lifePathB } = parseResult.data;
  const sum = reduceNumber(lifePathA + lifePathB);
  const sumInterp = ruleBasedEngine.interpretNumerology(sum);
  const aInterp = ruleBasedEngine.interpretNumerology(lifePathA);
  const bInterp = ruleBasedEngine.interpretNumerology(lifePathB);

  // Compatibility score heuristic based on element affinity
  const FIRE = [1, 3, 5, 9];
  const EARTH = [4, 6, 8];
  const AIR = [2, 7, 11];
  const WATER = [2, 6, 33];

  const getGroup = (n: number) => {
    if (FIRE.includes(n)) return 'Fire';
    if (EARTH.includes(n)) return 'Earth';
    if (AIR.includes(n)) return 'Air';
    if (WATER.includes(n)) return 'Water';
    return 'Ether';
  };

  const groupA = getGroup(lifePathA);
  const groupB = getGroup(lifePathB);
  const compatible = groupA === groupB;
  const score = lifePathA === lifePathB ? 95 : compatible ? 80 : 65;

  return res.json({
    success: true,
    lifePathA,
    lifePathB,
    compatibilityNumber: sum,
    compatibilityScore: score,
    summary: compatible
      ? `Life Paths ${lifePathA} and ${lifePathB} share a natural affinity. Both carry ${groupA} energy, which supports mutual understanding, shared values, and harmonious growth.`
      : `Life Paths ${lifePathA} (${groupA}) and ${lifePathB} (${groupB}) bring complementary energies. Differences can create growth and balance when navigated with awareness.`,
    compatibility: {
      number: sum,
      meaning: sumInterp.meaning,
    },
    personA: { number: lifePathA, traits: aInterp.traits.slice(0, 4), advice: aInterp.advice },
    personB: { number: lifePathB, traits: bInterp.traits.slice(0, 4), advice: bInterp.advice },
  });
});

export default router;
