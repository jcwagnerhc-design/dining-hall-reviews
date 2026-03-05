import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Get active food items for a tab in the current month
router.get('/:tab', async (req, res) => {
  try {
    const { tab } = req.params;
    const validTabs = ['hot_mains', 'global_flavors', 'desserts'];
    if (!validTabs.includes(tab)) {
      return res.status(400).json({ error: 'Invalid tab category' });
    }

    const monthYear = req.query.month_year || getCurrentMonthYear();

    const { data: cycles, error } = await supabase
      .from('monthly_cycles')
      .select('*, food_items(*)')
      .eq('month_year', monthYear)
      .eq('tab_category', tab)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;

    // Attach average rating to each item
    const items = await Promise.all(
      (cycles || []).map(async (cycle) => {
        const { data: ratings } = await supabase
          .from('star_ratings')
          .select('rating')
          .eq('food_item_id', cycle.food_item_id)
          .eq('month_year', monthYear);

        const avgRating =
          ratings && ratings.length > 0
            ? ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length
            : 0;

        return {
          ...cycle.food_items,
          cycle_id: cycle.id,
          display_order: cycle.display_order,
          avg_rating: Math.round(avgRating * 10) / 10,
          rating_count: ratings ? ratings.length : 0,
        };
      })
    );

    res.json(items);
  } catch (err) {
    console.error('Error fetching food items:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single food item detail
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const monthYear = req.query.month_year || getCurrentMonthYear();

    const { data: item, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get ratings
    const { data: ratings } = await supabase
      .from('star_ratings')
      .select('rating')
      .eq('food_item_id', id)
      .eq('month_year', monthYear);

    const avgRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length
        : 0;

    // Get reviews
    const { data: reviews } = await supabase
      .from('written_reviews')
      .select('id, graduation_year, gender, review_text, created_at, updated_at')
      .eq('food_item_id', id)
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false });

    res.json({
      ...item,
      avg_rating: Math.round(avgRating * 10) / 10,
      rating_count: ratings ? ratings.length : 0,
      reviews: reviews || [],
    });
  } catch (err) {
    console.error('Error fetching food item:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
