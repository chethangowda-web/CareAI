import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import symptomRoutes from './routes/symptoms.routes';
import historyRoutes from './routes/history.routes';
import placesRoutes from './routes/places.routes';
import reportRoutes from './routes/reports.routes';
import { globalRateLimiter } from './middleware/rateLimit.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// CORS — restrict to your app's bundle ID in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-app-domain.com']
    : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(express.json({ limit: '50kb' })); // Prevent large payload attacks
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/symptoms', symptomRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/places', placesRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler — never expose internals to client
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.userMessage || 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  logger.info(`CareAI server running on port ${PORT}`);
});

export default app;
