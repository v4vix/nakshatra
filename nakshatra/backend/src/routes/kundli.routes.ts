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

export default router;
