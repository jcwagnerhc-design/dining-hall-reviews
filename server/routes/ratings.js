import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

// Submit a star rating
router.post('/', async (req, res) => {
  try {
    const { food_item_id, rating, device_fingerprint } = req.body;

    if (!food_item_id || !rating) {
      return res.status(400).json({ error: 'food_item_id and rating are required' });
    }

    const numRating = Number(rating);
    if (numRating < 0.5 || numRating > 5.0 || (numRating * 2) % 1 !== 0) {
      return res.status(400).json({ error: 'Rating must be between 0.5 and 5.0 in half-star increments' });
    }

    const monthYear = getCurrentMonthYear();
    const ip = getClientIP(req);

    // Check for existing rating from this IP for this item this month
    const { data: existing } = await supabase
      .from('star_ratings')
      .select('id')
      .eq('food_item_id', food_item_id)
      .eq('month_year', monthYear)
      .eq('ip_address', ip)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'You have already rated this item this month' });
    }

    const { data, error } = await supabase
      .from('star_ratings')
      .insert({
        food_item_id,
        month_year: monthYear,
        rating: numRating,
        device_fingerprint: device_fingerprint || '',
        ip_address: ip,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You have already rated this item this month' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if this IP has already rated an item this month
router.get('/check/:food_item_id', async (req, res) => {
  try {
    const { food_item_id } = req.params;
    const monthYear = getCurrentMonthYear();
    const ip = getClientIP(req);

    const { data: existing } = await supabase
      .from('star_ratings')
      .select('id, rating')
      .eq('food_item_id', food_item_id)
      .eq('month_year', monthYear)
      .eq('ip_address', ip)
      .maybeSingle();

    res.json({ hasRated: !!existing, rating: existing?.rating || null });
  } catch (err) {
    console.error('Error checking rating:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
