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

// Submit a cuisine or dish recommendation
router.post('/', async (req, res) => {
  try {
    const { rec_type, text } = req.body;

    if (!rec_type || !text) {
      return res.status(400).json({ error: 'rec_type and text are required' });
    }

    if (!['cuisine', 'dish'].includes(rec_type)) {
      return res.status(400).json({ error: 'rec_type must be cuisine or dish' });
    }

    if (text.trim().length === 0 || text.length > 200) {
      return res.status(400).json({ error: 'Text must be between 1 and 200 characters' });
    }

    const monthYear = getCurrentMonthYear();
    const ip = getClientIP(req);

    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        month_year: monthYear,
        rec_type,
        text: text.trim(),
        ip_address: ip,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error submitting recommendation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
