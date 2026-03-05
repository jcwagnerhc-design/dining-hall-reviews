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

// Get active suggestion cards for the current month with vote counts
router.get('/', async (req, res) => {
  try {
    const monthYear = req.query.month_year || getCurrentMonthYear();

    const { data: cards, error } = await supabase
      .from('suggestion_cards')
      .select('*')
      .eq('month_year', monthYear)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;

    const ip = getClientIP(req);

    // Attach vote counts and user's vote to each card
    const cardsWithVotes = await Promise.all(
      (cards || []).map(async (card) => {
        const { data: votes } = await supabase
          .from('suggestion_votes')
          .select('vote_type')
          .eq('suggestion_card_id', card.id);

        const upvotes = (votes || []).filter((v) => v.vote_type === 'upvote').length;
        const downvotes = (votes || []).filter((v) => v.vote_type === 'downvote').length;

        // Check if this user already voted
        const { data: userVote } = await supabase
          .from('suggestion_votes')
          .select('vote_type')
          .eq('suggestion_card_id', card.id)
          .eq('ip_address', ip)
          .eq('month_year', monthYear)
          .maybeSingle();

        return {
          ...card,
          upvotes,
          downvotes,
          net_votes: upvotes - downvotes,
          user_vote: userVote?.vote_type || null,
        };
      })
    );

    res.json(cardsWithVotes);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a vote on a suggestion
router.post('/vote', async (req, res) => {
  try {
    const { suggestion_card_id, vote_type, device_fingerprint } = req.body;

    if (!suggestion_card_id || !vote_type) {
      return res.status(400).json({ error: 'suggestion_card_id and vote_type are required' });
    }

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({ error: 'vote_type must be upvote or downvote' });
    }

    const monthYear = getCurrentMonthYear();
    const ip = getClientIP(req);

    // Check for existing vote
    const { data: existing } = await supabase
      .from('suggestion_votes')
      .select('id, vote_type')
      .eq('suggestion_card_id', suggestion_card_id)
      .eq('ip_address', ip)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === vote_type) {
        // Remove vote (toggle off)
        await supabase.from('suggestion_votes').delete().eq('id', existing.id);
        return res.json({ action: 'removed', vote_type: null });
      }
      // Switch vote
      const { error } = await supabase
        .from('suggestion_votes')
        .update({ vote_type })
        .eq('id', existing.id);
      if (error) throw error;
      return res.json({ action: 'switched', vote_type });
    }

    // Create new vote
    const { error } = await supabase
      .from('suggestion_votes')
      .insert({
        suggestion_card_id,
        vote_type,
        device_fingerprint: device_fingerprint || '',
        ip_address: ip,
        month_year: monthYear,
      });

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You have already voted on this suggestion this month' });
      }
      throw error;
    }

    res.status(201).json({ action: 'created', vote_type });
  } catch (err) {
    console.error('Error submitting vote:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
