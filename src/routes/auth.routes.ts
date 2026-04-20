import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/connection';

const router = Router();

router.get('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

router.patch('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, phone, dob } = req.body;
  const result = await query(
    `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), dob = COALESCE($3, dob)
     WHERE id = $4 RETURNING id, firebase_uid, name, email, phone, dob, created_at`,
    [name, phone, dob, req.user!.id]
  );
  res.json({ user: result.rows[0] });
});

export default router;
