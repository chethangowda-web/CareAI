import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/connection';
import { generateAndUploadReport } from '../services/pdf.service';
import { getPresignedUrl } from '../services/s3.service';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/v1/reports/:recordId — generate (or retrieve presigned URL for) a PDF report
router.get('/:recordId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { recordId } = req.params;

  try {
    // Verify the record belongs to the user
    const result = await query(
      `SELECT hr.*, u.name as user_name
       FROM health_records hr
       JOIN users u ON u.id = hr.user_id
       WHERE hr.id = $1 AND hr.user_id = $2`,
      [recordId, req.user!.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const record = result.rows[0];

    const url = await generateAndUploadReport({
      recordId,
      userName: record.user_name || req.user!.name,
      date: record.created_at,
      symptoms: record.symptoms,
      severity: record.severity,
      temperature: record.temperature,
      temperatureUnit: record.temperature_unit,
      urgencyLevel: record.urgency_level,
      explanation: record.ai_explanation,
      selfCareSteps: record.self_care_steps || [],
    });

    res.json({ url });
  } catch (err) {
    logger.error('Report generation failed', { recordId, error: (err as Error).message });
    res.status(500).json({ error: 'Report generation failed. Please try again.' });
  }
});

export default router;
