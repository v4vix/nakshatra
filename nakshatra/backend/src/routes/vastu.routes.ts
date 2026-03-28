import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ruleBasedEngine } from '../services/llm/RuleBasedEngine';
import { llmOrchestrator } from '../services/llm/LLMOrchestrator';

const router = Router();

const VALID_ZONES = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'Center'];

const ZoneAnalysisSchema = z.object({
  zone: z.enum(['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'Center']),
  defects: z.array(z.string()).optional().default([]),
  includeInterpretation: z.boolean().optional().default(false),
  question: z.string().optional(),
});

const FullAnalysisSchema = z.object({
  zones: z.record(z.object({
    defects: z.array(z.string()).optional().default([]),
    features: z.array(z.string()).optional().default([]),
  })).optional(),
  question: z.string().optional(),
  propertyType: z.enum(['home', 'office', 'shop', 'plot']).optional().default('home'),
});

/**
 * GET /api/v1/vastu/zones
 * List all 9 Vastu zones with basic descriptions.
 */
router.get('/zones', (_req: Request, res: Response) => {
  const zones = VALID_ZONES.map(zone => {
    const interp = ruleBasedEngine.interpretVastu(zone, []);
    return {
      zone,
      element: interp.element,
      ruling: interp.ruling,
      description: interp.description.split('.')[0] + '.',
    };
  });

  res.json({ success: true, count: zones.length, zones });
});

/**
 * POST /api/v1/vastu/zone
 * Get detailed analysis of a specific Vastu zone.
 */
router.post('/zone', async (req: Request, res: Response) => {
  try {
    const parseResult = ZoneAnalysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const { zone, defects, includeInterpretation, question } = parseResult.data;
    const interp = ruleBasedEngine.interpretVastu(zone, defects);

    let interpretation;
    if (includeInterpretation) {
      const llmResult = await llmOrchestrator.process({
        domain: 'vastu',
        question: question || `Give a detailed Vastu Shastra analysis of the ${zone} zone.`,
        context: { zone, defects, element: interp.element, ruling: interp.ruling },
      });
      interpretation = { content: llmResult.content, provider: llmResult.provider };
    }

    return res.json({
      success: true,
      zone,
      analysis: {
        element: interp.element,
        ruling: interp.ruling,
        description: interp.description,
        defectAnalysis: interp.defectAnalysis,
        remedies: interp.remedies,
      },
      ...(interpretation && { interpretation }),
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: 'Vastu analysis failed', details: error.message });
  }
});

/**
 * POST /api/v1/vastu/analyze
 * Full property Vastu analysis across multiple zones.
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const parseResult = FullAnalysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }

    const { zones: zoneData, question, propertyType } = parseResult.data;

    const zoneAnalyses = VALID_ZONES.map(zone => {
      const data = zoneData?.[zone];
      const defects = data?.defects || [];
      const interp = ruleBasedEngine.interpretVastu(zone, defects);
      return { zone, defects, element: interp.element, ruling: interp.ruling, remedies: interp.remedies, defectAnalysis: interp.defectAnalysis };
    });

    const problematicZones = zoneAnalyses.filter(z => z.defects.length > 0);
    const overallScore = Math.max(0, 100 - problematicZones.length * 12);

    const contextForLLM = {
      propertyType,
      zones: zoneAnalyses.reduce((acc, z) => ({
        ...acc,
        [z.zone]: { defects: z.defects, element: z.element, ruling: z.ruling },
      }), {}),
      problematicZones: problematicZones.map(z => z.zone),
      overallVastuScore: overallScore,
    };

    const llmResult = await llmOrchestrator.process({
      domain: 'vastu',
      question: question || `Provide a comprehensive Vastu Shastra analysis for this ${propertyType}.`,
      context: contextForLLM,
    }).catch(() => ({
      content: `Overall Vastu Score: ${overallScore}/100. Problematic zones: ${problematicZones.map(z => z.zone).join(', ') || 'None'}. Focus remedies on highlighted zones for maximum benefit.`,
      provider: 'rule-based' as const,
      confidence: 0.6,
      streaming: false,
    }));

    return res.json({
      success: true,
      propertyType,
      overallScore,
      zoneAnalyses,
      problematicZones: problematicZones.map(z => z.zone),
      interpretation: {
        content: llmResult.content,
        provider: llmResult.provider,
      },
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: 'Full Vastu analysis failed', details: error.message });
  }
});

export default router;
