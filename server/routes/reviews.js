import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Submit or update a written review
router.post('/', async (req, res) => {
  try {
    const { food_item_id, email, graduation_year, gender, review_text } = req.body;

    if (!food_item_id || !email || !graduation_year || !review_text) {
      return res.status(400).json({ error: 'food_item_id, email, graduation_year, and review_text are required' });
    }

    // Validate blair.edu email
    if (!email.toLowerCase().endsWith('@blair.edu')) {
      return res.status(400).json({ error: 'A valid @blair.edu email address is required' });
    }

    if (review_text.trim().length === 0) {
      return res.status(400).json({ error: 'Review text cannot be empty' });
    }

    if (review_text.length > 2000) {
      return res.status(400).json({ error: 'Review must be under 2000 characters' });
    }

    const monthYear = getCurrentMonthYear();

    // Check for existing review from this email for this item this month
    const { data: existing } = await supabase
      .from('written_reviews')
      .select('id')
      .eq('food_item_id', food_item_id)
      .eq('month_year', monthYear)
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      // Update existing review
      const { data, error } = await supabase
        .from('written_reviews')
        .update({
          review_text: review_text.trim(),
          graduation_year,
          gender: gender || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ ...data, updated: true });
    }

    // Create new review
    const { data, error } = await supabase
      .from('written_reviews')
      .insert({
        food_item_id,
        month_year: monthYear,
        email: email.toLowerCase(),
        graduation_year,
        gender: gender || '',
        review_text: review_text.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for an item (public — emails are hidden)
router.get('/:food_item_id', async (req, res) => {
  try {
    const { food_item_id } = req.params;
    const monthYear = req.query.month_year || getCurrentMonthYear();

    const { data, error } = await supabase
      .from('written_reviews')
      .select('id, graduation_year, gender, review_text, created_at, updated_at')
      .eq('food_item_id', food_item_id)
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
