import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../db/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { runSummarizer } from '../services/aiSummarizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDest = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: uploadDest,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// All admin routes require auth
router.use(requireAuth);

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ========== OVERVIEW ==========

router.get('/overview', async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();

    const [ratingsRes, reviewsRes, cyclesRes, suggestionsRes, recsRes] = await Promise.all([
      supabase.from('star_ratings').select('id', { count: 'exact' }).eq('month_year', monthYear),
      supabase.from('written_reviews').select('id', { count: 'exact' }).eq('month_year', monthYear),
      supabase.from('monthly_cycles').select('id', { count: 'exact' }).eq('month_year', monthYear).eq('is_active', true),
      supabase.from('suggestion_cards').select('id', { count: 'exact' }).eq('month_year', monthYear).eq('is_active', true),
      supabase.from('recommendations').select('id', { count: 'exact' }).eq('month_year', monthYear),
    ]);

    res.json({
      month_year: monthYear,
      total_ratings: ratingsRes.count || 0,
      total_reviews: reviewsRes.count || 0,
      active_food_items: cyclesRes.count || 0,
      active_suggestions: suggestionsRes.count || 0,
      total_recommendations: recsRes.count || 0,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== FOOD ITEM MANAGEMENT ==========

// List all food items (master list)
router.get('/food-items', async (req, res) => {
  try {
    const { tab_category } = req.query;
    let query = supabase.from('food_items').select('*').order('name');
    if (tab_category) query = query.eq('tab_category', tab_category);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create food item
router.post('/food-items', async (req, res) => {
  try {
    const { name, description, image_url, tab_category } = req.body;
    if (!name || !tab_category) {
      return res.status(400).json({ error: 'name and tab_category are required' });
    }
    const { data, error } = await supabase
      .from('food_items')
      .insert({ name, description: description || '', image_url: image_url || '', tab_category })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update food item
router.put('/food-items/:id', async (req, res) => {
  try {
    const { name, description, image_url, tab_category } = req.body;
    const { data, error } = await supabase
      .from('food_items')
      .update({ name, description, image_url, tab_category, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete food item
router.delete('/food-items/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('food_items').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image for food item
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ========== MONTHLY CYCLE MANAGEMENT ==========

// Get cycles for a month
router.get('/cycles', async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();
    const { data, error } = await supabase
      .from('monthly_cycles')
      .select('*, food_items(*)')
      .eq('month_year', monthYear)
      .order('tab_category')
      .order('display_order');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to a monthly cycle
router.post('/cycles', async (req, res) => {
  try {
    const { food_item_id, tab_category, display_order } = req.body;
    const monthYear = req.body.month_year || getCurrentMonthYear();

    if (!food_item_id || !tab_category) {
      return res.status(400).json({ error: 'food_item_id and tab_category are required' });
    }

    // Check if tab already has 12 items
    const { count } = await supabase
      .from('monthly_cycles')
      .select('id', { count: 'exact' })
      .eq('month_year', monthYear)
      .eq('tab_category', tab_category)
      .eq('is_active', true);

    if (count >= 12) {
      return res.status(400).json({ error: 'Maximum 12 items per tab per month' });
    }

    const { data, error } = await supabase
      .from('monthly_cycles')
      .insert({
        month_year: monthYear,
        food_item_id,
        tab_category,
        display_order: display_order || count || 0,
      })
      .select('*, food_items(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This item is already in this month cycle' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cycle
router.delete('/cycles/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('monthly_cycles').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== SUGGESTION MANAGEMENT ==========

router.get('/suggestions', async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();
    const { data: cards, error } = await supabase
      .from('suggestion_cards')
      .select('*')
      .eq('month_year', monthYear)
      .order('created_at');
    if (error) throw error;

    const cardsWithVotes = await Promise.all(
      (cards || []).map(async (card) => {
        const { data: votes } = await supabase
          .from('suggestion_votes')
          .select('vote_type')
          .eq('suggestion_card_id', card.id);
        const upvotes = (votes || []).filter((v) => v.vote_type === 'upvote').length;
        const downvotes = (votes || []).filter((v) => v.vote_type === 'downvote').length;
        return { ...card, upvotes, downvotes, net_votes: upvotes - downvotes };
      })
    );

    res.json(cardsWithVotes);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/suggestions', async (req, res) => {
  try {
    const { title, description, image_url } = req.body;
    const monthYear = req.body.month_year || getCurrentMonthYear();
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('suggestion_cards')
      .insert({ month_year: monthYear, title, description: description || '', image_url: image_url || '' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/suggestions/:id', async (req, res) => {
  try {
    const { title, description, image_url, is_active } = req.body;
    const { data, error } = await supabase
      .from('suggestion_cards')
      .update({ title, description, image_url, is_active, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/suggestions/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('suggestion_cards').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== RATINGS & REVIEWS DATA ==========

// All ratings with filters
router.get('/ratings', async (req, res) => {
  try {
    const { month_year, food_item_id, tab_category } = req.query;
    const monthYear = month_year || getCurrentMonthYear();

    let query = supabase
      .from('star_ratings')
      .select('*, food_items(name, tab_category)')
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false });

    if (food_item_id) query = query.eq('food_item_id', food_item_id);

    const { data, error } = await query;
    if (error) throw error;

    // Filter by tab_category if specified (via the joined food_items)
    let filtered = data || [];
    if (tab_category) {
      filtered = filtered.filter((r) => r.food_items?.tab_category === tab_category);
    }

    // Compute distribution per item
    const byItem = {};
    for (const r of filtered) {
      const key = r.food_item_id;
      if (!byItem[key]) {
        byItem[key] = { food_item_id: key, name: r.food_items?.name, ratings: [], distribution: {} };
      }
      byItem[key].ratings.push(r);
      const bucket = String(r.rating);
      byItem[key].distribution[bucket] = (byItem[key].distribution[bucket] || 0) + 1;
    }

    const summary = Object.values(byItem).map((item) => ({
      ...item,
      count: item.ratings.length,
      average: item.ratings.reduce((s, r) => s + Number(r.rating), 0) / item.ratings.length,
    }));

    res.json({ raw: filtered, summary });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// All reviews with emails (admin only)
router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    const { month_year, food_item_id } = req.query;
    const monthYear = month_year || getCurrentMonthYear();

    let query = supabase
      .from('written_reviews')
      .select('*, food_items(name, tab_category)')
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false });

    if (food_item_id) query = query.eq('food_item_id', food_item_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Demographic breakdown
router.get('/demographics', async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();

    // From reviews (has graduation year + gender data)
    const { data: reviews } = await supabase
      .from('written_reviews')
      .select('graduation_year, gender')
      .eq('month_year', monthYear);

    const byGradYear = {};
    const byGender = {};
    for (const r of reviews || []) {
      byGradYear[r.graduation_year] = (byGradYear[r.graduation_year] || 0) + 1;
      if (r.gender) {
        byGender[r.gender] = (byGender[r.gender] || 0) + 1;
      }
    }

    res.json({
      total_reviews: (reviews || []).length,
      by_graduation_year: byGradYear,
      by_gender: byGender,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== HISTORICAL DATA ==========

// Get all months that have data
router.get('/history/months', async (req, res) => {
  try {
    const { data: ratings } = await supabase.from('star_ratings').select('month_year');
    const { data: reviews } = await supabase.from('written_reviews').select('month_year');

    const months = new Set();
    for (const r of ratings || []) months.add(r.month_year);
    for (const r of reviews || []) months.add(r.month_year);

    const sorted = Array.from(months).sort().reverse();
    res.json(sorted);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get historical trend data (avg rating per item across months)
router.get('/history/trends', async (req, res) => {
  try {
    const { food_item_id, tab_category } = req.query;

    let query = supabase.from('star_ratings').select('food_item_id, month_year, rating, food_items(name, tab_category)');
    if (food_item_id) query = query.eq('food_item_id', food_item_id);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (tab_category) {
      filtered = filtered.filter((r) => r.food_items?.tab_category === tab_category);
    }

    // Group by item + month
    const grouped = {};
    for (const r of filtered) {
      const key = `${r.food_item_id}|${r.month_year}`;
      if (!grouped[key]) {
        grouped[key] = {
          food_item_id: r.food_item_id,
          name: r.food_items?.name,
          month_year: r.month_year,
          ratings: [],
        };
      }
      grouped[key].ratings.push(Number(r.rating));
    }

    const trends = Object.values(grouped).map((g) => ({
      food_item_id: g.food_item_id,
      name: g.name,
      month_year: g.month_year,
      average: g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length,
      count: g.ratings.length,
    }));

    trends.sort((a, b) => a.month_year.localeCompare(b.month_year));
    res.json(trends);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== AI SUMMARIES ==========

router.get('/ai-summaries', async (req, res) => {
  try {
    const monthYear = req.query.month_year;
    let query = supabase.from('ai_summaries').select('*').order('created_at', { ascending: false });
    if (monthYear) query = query.eq('month_year', monthYear);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manually trigger AI summarizer (admin only)
router.post('/ai-summaries/run', requireAdmin, async (req, res) => {
  try {
    const monthYear = req.body.month_year || getCurrentMonthYear();
    const summary = await runSummarizer(monthYear);
    res.json(summary);
  } catch (err) {
    console.error('AI summarizer error:', err);
    res.status(500).json({ error: 'Failed to run AI summarizer: ' + err.message });
  }
});

// ========== RECOMMENDATIONS (raw data for admin) ==========

router.get('/recommendations', requireAdmin, async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== ACCOUNT MANAGEMENT ==========

router.get('/accounts', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, role, is_active, created_at')
      .order('created_at');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/accounts', requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password, and role are required' });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'role must be admin or staff' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least 1 number' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({ username, password_hash, role })
      .select('id, username, role, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/accounts/:id', requireAdmin, async (req, res) => {
  try {
    const { is_active, password } = req.body;
    const updates = {};

    if (typeof is_active === 'boolean') updates.is_active = is_active;

    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      if (!/\d/.test(password)) return res.status(400).json({ error: 'Password must contain at least 1 number' });
      updates.password_hash = await bcrypt.hash(password, 12);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, username, role, is_active, created_at')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/accounts/:id', requireAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const { error } = await supabase.from('admin_users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
