import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { kundliService } from '../services/astrology/KundliService';
import { ruleBasedEngine } from '../services/llm/RuleBasedEngine';
import { llmOrchestrator } from '../services/llm/LLMOrchestrator';

const router = Router();

// Validation schema for birth data
const BirthDataSchema = z.object({
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, 'dateOfBirth must be in format YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
  place: z.string().optional(),
  includeInterpretation: z.boolean().optional().default(false),
  question: z.string().optional(),
});

/**
 * POST /api/v1/kundli/calculate
 * Compute a complete Vedic birth chart.
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const parseResult = BirthDataSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const birthData = parseResult.data;
    const kundli = await kundliService.computeKundli(birthData);

    // Optionally include LLM interpretation
    let interpretation: string | undefined;
    if (birthData.includeInterpretation) {
      const llmResult = await llmOrchestrator.process({
        domain: 'kundli',
        question: birthData.question || `Give a comprehensive birth chart interpretation for ${birthData.name}.`,
        context: {
          lagna: kundli.lagnaName,
          moonSign: kundli.moonSign,
          sunSign: kundli.sunSign,
          nakshatraName: kundli.birthNakshatra,
          planets: Object.values(kundli.planets).map(p => ({
            planet: p.planet,
            rashi: p.rashi,
            house: p.house,
            isRetrograde: p.isRetrograde,
          })),
          yogas: kundli.presentYogas,
          doshas: kundli.presentDoshas,
          currentDasha: kundli.currentDashaString,
        },
      });
      interpretation = llmResult.content;
    }

    return res.json({
      success: true,
      kundli: {
        name: kundli.name,
        dateOfBirth: kundli.dateOfBirth,
        placeOfBirth: kundli.placeOfBirth,
        latitude: kundli.latitude,
        longitude: kundli.longitude,
        lahiriAyanamsa: kundli.lahiriAyanamsa,
        lagna: {
          rashiName: kundli.lagnaName,
          rashiIndex: kundli.lagna.rashiIndex,
          degree: kundli.lagna.degreeInRashi,
          nakshatra: kundli.lagna.nakshatraName,
          pada: kundli.lagna.pada,
        },
        moonSign: kundli.moonSign,
        sunSign: kundli.sunSign,
        birthNakshatra: kundli.birthNakshatra,
        birthNakshatraPada: kundli.birthNakshatraPada,
        birthNakshatraLord: kundli.birthNakshatraLord,
        planets: kundli.planets,
        houses: kundli.houses,
        yogas: {
          present: kundli.presentYogas,
          details: kundli.yogas.filter(y => y.isPresent),
        },
        doshas: {
          present: kundli.presentDoshas,
          details: kundli.doshas,
        },
        dasha: {
          current: kundli.currentDashaString,
          sequence: kundli.dashaSequence.allMahadashas.slice(0, 12), // next 12 mahadashas
          birthNakshatraLord: kundli.dashaSequence.birthNakshatraLord,
        },
      },
      ...(interpretation && { interpretation }),
    });
  } catch (err) {
    const error = err as Error;
    console.error('[KundliRoute] Error:', error.message);
    return res.status(500).json({ error: 'Failed to compute kundli', details: error.message });
  }
});

/**
 * GET /api/v1/kundli/nakshatras
 * Return all 27 Nakshatras with metadata.
 */
router.get('/nakshatras', (_req: Request, res: Response) => {
  const nakshatras = kundliService.getAllNakshatras();
  res.json({ success: true, count: nakshatras.length, nakshatras });
});

/**
 * GET /api/v1/kundli/rashis
 * Return all 12 Rashis with metadata.
 */
router.get('/rashis', (_req: Request, res: Response) => {
  const rashis = kundliService.getAllRashis();
  res.json({ success: true, count: rashis.length, rashis });
});

/**
 * GET /api/v1/kundli/grahas
 * Return all 9 Vedic Grahas with metadata.
 */
router.get('/grahas', (_req: Request, res: Response) => {
  const grahas = kundliService.getAllGrahas();
  res.json({ success: true, count: grahas.length, grahas });
});

// ─── Sade Sati ──────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SADE_SATI_REMEDIES = [
  'Chant Shani Stotram every Saturday morning',
  'Donate black sesame, mustard oil, or blue cloth on Saturdays',
  'Recite "ॐ शं शनैश्चराय नमः" 108 times daily',
  'Practice Hanuman Chalisa — protective during Shani periods',
  'Serve elders; discipline and ethical conduct reduce karmic load',
  'Feed crows or dark-coloured birds on Saturdays',
  'Light sesame oil lamp at Shani or Hanuman temple on Saturdays',
];

function getSaturnSiderealLon(): number {
  const J2000_UNIX = 946728000;
  const SATURN_PERIOD_YRS = 29.4571;
  const REF_LONG = 330.0;
  const yearsSince = (Date.now() / 1000 - J2000_UNIX) / (365.25 * 86400);
  return (REF_LONG + yearsSince * (360 / SATURN_PERIOD_YRS)) % 360;
}

/**
 * POST /api/v1/kundli/sade-sati
 * Compute Sade Sati status for a given Moon sign.
 */
router.post('/sade-sati', async (req: Request, res: Response) => {
  try {
    const { moonSign, moonSignIndex } = req.body as { moonSign?: string; moonSignIndex?: number };

    let moonIdx: number;
    if (typeof moonSignIndex === 'number') {
      moonIdx = moonSignIndex % 12;
    } else if (moonSign && RASHI_NAMES.includes(moonSign)) {
      moonIdx = RASHI_NAMES.indexOf(moonSign);
    } else {
      return res.status(400).json({ error: 'moonSign or moonSignIndex is required' });
    }

    const saturnLon = getSaturnSiderealLon();
    const saturnSignIdx = Math.floor(saturnLon / 30) % 12;
    const saturnSign = RASHI_NAMES[saturnSignIdx];

    const sadeSatiSigns = [((moonIdx - 1) + 12) % 12, moonIdx, (moonIdx + 1) % 12];
    const isActive = sadeSatiSigns.includes(saturnSignIdx);
    const phaseIdx = isActive ? sadeSatiSigns.indexOf(saturnSignIdx) : null;

    const degRemaining = 30 - (saturnLon % 30);
    const daysRemainingInPhase = Math.round(degRemaining / 0.0339);

    const signsToNext = (((moonIdx - 1 + 12) % 12) - saturnSignIdx + 12) % 12;
    const daysToNext = Math.round((signsToNext * 30 + degRemaining) / 0.0339);

    const phaseDescriptions = [
      'Rising phase (12th from Moon) — preparations and latent pressure building',
      'Peak phase (Moon sign) — maximum intensity; challenges to mind, health, finances',
      'Setting phase (2nd from Moon) — winding down; lessons in speech and wealth',
    ];

    return res.json({
      success: true,
      natalMoonSign: RASHI_NAMES[moonIdx],
      currentSaturnSign: saturnSign,
      sadeSatiActive: isActive,
      phase: phaseIdx,
      phaseDescription: phaseIdx !== null ? phaseDescriptions[phaseIdx] : null,
      daysRemainingInPhase: isActive ? daysRemainingInPhase : null,
      yearsRemainingInPhase: isActive ? Math.round(daysRemainingInPhase / 365.25 * 10) / 10 : null,
      daysToNextSadeSati: !isActive ? daysToNext : null,
      yearsToNextSadeSati: !isActive ? Math.round(daysToNext / 365.25 * 10) / 10 : null,
      summary: isActive
        ? `Sade Sati ACTIVE — Saturn in ${saturnSign} (${['12th from','on','2nd from'][phaseIdx!]} Moon sign ${RASHI_NAMES[moonIdx]}). Ends in ~${Math.round(daysRemainingInPhase / 365.25 * 10) / 10} years.`
        : `Sade Sati NOT active. Saturn in ${saturnSign}. Next begins in ~${Math.round(daysToNext / 365.25 * 10) / 10} years.`,
      remedies: SADE_SATI_REMEDIES,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute Sade Sati' });
  }
});

// ─── Ashtakavarga ────────────────────────────────────────────────────────────

const ASHTAK_OFFSETS: Record<string, number[]> = {
  Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
  Moon:    [3, 6, 7, 8, 10, 11],
  Mars:    [1, 2, 4, 7, 8, 10, 11],
  Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
  Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
  Venus:   [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn:  [3, 5, 6, 11],
  Lagna:   [1, 3, 4, 6, 10, 11],
};

/**
 * POST /api/v1/kundli/ashtakavarga
 * Compute Sarva Ashtakavarga benefic point tally for a birth chart.
 * Expects the same BirthDataSchema as /calculate.
 */
router.post('/ashtakavarga', async (req: Request, res: Response) => {
  try {
    const parseResult = BirthDataSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parseResult.error.issues });
    }
    const { dateOfBirth, latitude, longitude, timezone } = parseResult.data;
    const kundli = await kundliService.calculateKundli({ dateOfBirth, latitude, longitude, timezone });

    const planets = kundli.planets as Record<string, { rashiIndex: number }>;
    const lagnaIdx = kundli.ascendant?.rashiIndex ?? 0;
    const positions: Record<string, number> = { Lagna: lagnaIdx };
    for (const [name, data] of Object.entries(planets)) {
      if (name in ASHTAK_OFFSETS) positions[name] = data.rashiIndex ?? 0;
    }

    const scores = new Array<number>(12).fill(0);
    for (const [contributor, offsets] of Object.entries(ASHTAK_OFFSETS)) {
      const base = positions[contributor] ?? 0;
      for (const off of offsets) scores[(base + off - 1) % 12]++;
    }
    // Moon's additional contribution from Sun
    const sunBase = positions['Sun'] ?? 0;
    for (const off of [3, 6, 10, 11]) scores[(sunBase + off - 1) % 12]++;

    const label = (s: number) =>
      s >= 30 ? 'Excellent' : s >= 25 ? 'Good' : s >= 20 ? 'Moderate' : s >= 15 ? 'Weak' : 'Very weak';

    const perSign = RASHI_NAMES.map((sign, i) => ({ sign, score: scores[i], strength: label(scores[i]) }));
    const sorted = [...perSign].sort((a, b) => b.score - a.score);
    const total = scores.reduce((a, b) => a + b, 0);
    const lagnaScore = scores[lagnaIdx];
    const lagnaSign = RASHI_NAMES[lagnaIdx];

    return res.json({
      success: true,
      sarvaAshtakavarga: perSign,
      totalBeneficPoints: total,
      bestTransitSigns: sorted.slice(0, 3).map((s) => s.sign),
      weakestSigns: sorted.slice(-3).map((s) => s.sign),
      lagnaScore,
      summary: `Total: ${total}/337. Best transit signs: ${sorted.slice(0, 3).map((s) => s.sign).join(', ')}. Lagna (${lagnaSign}): ${lagnaScore}/56 — ${label(lagnaScore)}.`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute Ashtakavarga' });
  }
});

// ─── Prashna Kundli ──────────────────────────────────────────────────────────

const PRASHNA_TOPICS: Record<string, number> = {
  marriage: 7, relationship: 7, partner: 7, love: 5, romance: 5,
  career: 10, job: 10, work: 10, business: 7, money: 2,
  wealth: 2, finance: 2, health: 1, illness: 6, disease: 6,
  children: 5, child: 5, property: 4, home: 4, education: 5,
  travel: 9, foreign: 12, spiritual: 9, enemy: 6, court: 6, legal: 6,
};

const PRASHNA_HOUSE_SIG: Record<number, string> = {
  1: 'Self, health, overall outlook', 2: 'Wealth, family, speech',
  3: 'Courage, siblings, communication', 4: 'Home, mother, property',
  5: 'Children, creativity, speculation', 6: 'Enemies, debts, disputes',
  7: 'Partnerships, marriage, contracts', 8: 'Hidden matters, transformation',
  9: 'Dharma, fortune, higher learning', 10: 'Career, status, authority',
  11: 'Gains, income, fulfilment', 12: 'Losses, liberation, foreign lands',
};

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

/**
 * POST /api/v1/kundli/prashna
 * Compute a Prashna (Horary) chart for the moment a question is asked.
 */
router.post('/prashna', async (req: Request, res: Response) => {
  try {
    const { question, latitude = 28.6139, longitude = 77.209, timezone = 5.5 } = req.body as {
      question?: string; latitude?: number; longitude?: number; timezone?: number;
    };

    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'question must be at least 5 characters' });
    }

    const now = new Date();
    const isoNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const chart = await kundliService.calculateKundli({ dateOfBirth: isoNow, latitude, longitude, timezone });

    const primaryHouse = Object.entries(PRASHNA_TOPICS).find(([kw]) =>
      question.toLowerCase().includes(kw)
    )?.[1] ?? 1;

    const lagnaIdx = chart.ascendant?.rashiIndex ?? 0;
    const lagnaSign = RASHI_NAMES[lagnaIdx];
    const houseSignIdx = (lagnaIdx + primaryHouse - 1) % 12;
    const houseSign = RASHI_NAMES[houseSignIdx];
    const houseLord = SIGN_LORDS[houseSign] ?? 'Unknown';

    const moonData = (chart.planets as Record<string, { rashiIndex: number; house: number }>)['Moon'];
    const moonSign = RASHI_NAMES[moonData?.rashiIndex ?? 0];
    const moonHouse = moonData?.house ?? 0;
    const moonWaxing = moonHouse <= 6;

    const lordData = (chart.planets as Record<string, { house: number }>)[houseLord];
    const lordHouse = lordData?.house ?? 0;
    const lordStrong = [1, 4, 5, 7, 9, 10, 11].includes(lordHouse);
    const verdict = lordStrong && moonWaxing ? 'Favourable' : 'Challenging';

    return res.json({
      success: true,
      question,
      prashnaLagna: lagnaSign,
      prashnaLagnaLord: SIGN_LORDS[lagnaSign],
      moonSign,
      moonWaxing,
      primaryHouse,
      primaryHouseSignification: PRASHNA_HOUSE_SIG[primaryHouse],
      primaryHouseSign: houseSign,
      primaryHouseLord: houseLord,
      lordWellPlaced: lordStrong,
      verdict,
      summary: `Prashna Lagna: ${lagnaSign}. Moon in ${moonSign} (${moonWaxing ? 'waxing' : 'waning'}). The ${primaryHouse}th house (${PRASHNA_HOUSE_SIG[primaryHouse]}) governs your question. Its lord ${houseLord} is in house ${lordHouse} — ${lordStrong ? 'well-placed' : 'challenged'}. Verdict: ${verdict}.`,
      disclaimers: [
        'Prashna Kundli is a traditional horary system for guidance only.',
        'This does not constitute medical, legal, or financial advice.',
      ],
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute Prashna Kundli' });
  }
});

export default router;
