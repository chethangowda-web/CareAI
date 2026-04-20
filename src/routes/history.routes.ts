import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/connection';

const router = Router();

// GET /api/v1/history — paginated records for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  const result = await query(
    `SELECT id, symptoms, duration, severity, temperature, temperature_unit,
            urgency_level, ai_explanation, self_care_steps, escalation_flag, created_at
     FROM health_records
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user!.id, limit, offset]
  );

  res.json({ records: result.rows, total: result.rowCount });
});

// GET /api/v1/history/:id — single record detail
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT * FROM health_records WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found.' });
  res.json({ record: result.rows[0] });
});

export default router;
