import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { analyzeRateLimiter } from '../middleware/rateLimit.middleware';
import { validate, symptomAnalysisSchema } from '../middleware/validate.middleware';
import { analyzeSymptoms } from '../services/openai.service';
import { query } from '../db/connection';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/v1/symptoms/analyze
router.post(
  '/analyze',
  requireAuth,
  analyzeRateLimiter,
  validate(symptomAnalysisSchema),
  async (req: AuthRequest, res: Response) => {
    const { symptoms, duration, severity, temperature, temperatureUnit } = req.body;

    try {
      const result = await analyzeSymptoms({ symptoms, duration, severity, temperature, temperatureUnit });
      const recordId = uuidv4();

      // Store health record in DB (don't block response)
      try {
        await query(
          `INSERT INTO health_records (id, user_id, symptoms, duration, severity, temperature, temperature_unit,
            urgency_level, ai_explanation, self_care_steps, escalation_flag, confidence)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            recordId,
            req.user!.id,
            symptoms,
            duration,
            severity,
            temperature || null,
            temperatureUnit || 'C',
            result.urgency_level,
            result.explanation,
            JSON.stringify(result.self_care_steps),
            result.escalation_flag,
            result.confidence,
          ]
        );
      } catch (dbErr) {
        logger.error('DB insert failed for health record', { error: (dbErr as Error).message });
      }

      res.json({ data: result, recordId });
    } catch (err) {
      logger.error('Symptom analysis route error', { error: (err as Error).message });
      res.status(500).json({ error: 'Analysis failed. Please try again.' });
    }
  }
);

export default router;
