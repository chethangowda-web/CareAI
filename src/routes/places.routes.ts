import { Router, Response } from 'express';
import axios from 'axios';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Simple in-memory cache (replace with Redis in production)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// GET /api/v1/places/nearby?lat=&lng=&type=doctor|hospital
router.get('/nearby', requireAuth, async (req: AuthRequest, res: Response) => {
  const { lat, lng, type } = req.query;

  if (!lat || !lng || !type) {
    return res.status(400).json({ error: 'lat, lng and type are required.' });
  }

  const validTypes = ['doctor', 'hospital'];
  if (!validTypes.includes(type as string)) {
    return res.status(400).json({ error: 'type must be "doctor" or "hospital".' });
  }

  const cacheKey = `places:${lat}:${lng}:${type}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ places: cached, cached: true });

  const keyword = type === 'doctor' ? 'doctor clinic' : 'hospital';

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000,
        type: type === 'doctor' ? 'doctor' : 'hospital',
        keyword,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    });

    const places = (response.data.results || []).slice(0, 15).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      rating: p.rating,
      open_now: p.opening_hours?.open_now,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      distance: Math.round(
        getDistanceMeters(Number(lat), Number(lng), p.geometry.location.lat, p.geometry.location.lng)
      ),
    })).sort((a: any, b: any) => a.distance - b.distance);

    setCache(cacheKey, places);
    res.json({ places });
  } catch (err) {
    logger.error('Google Places API error', { error: (err as Error).message });
    res.status(502).json({ error: 'Unable to fetch nearby places. Please try again.' });
  }
});

// Haversine formula
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
