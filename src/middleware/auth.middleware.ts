import { Request, Response, NextFunction } from 'express';
import admin from '../utils/firebase';
import { query } from '../db/connection';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: { id: string; firebase_uid: string; email: string; name: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Upsert user in our DB on first auth
    const result = await query(
      `INSERT INTO users (firebase_uid, name, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO UPDATE
         SET name = COALESCE(EXCLUDED.name, users.name),
             email = COALESCE(EXCLUDED.email, users.email)
       RETURNING id, firebase_uid, name, email`,
      [decoded.uid, decoded.name || null, decoded.email || null]
    );

    req.user = result.rows[0];
    next();
  } catch (err) {
    logger.warn('Invalid token attempt');
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
