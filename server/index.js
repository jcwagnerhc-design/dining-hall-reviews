import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import ratingsRoutes from './routes/ratings.js';
import reviewsRoutes from './routes/reviews.js';
import suggestionsRoutes from './routes/suggestions.js';
import recommendationsRoutes from './routes/recommendations.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Only start listener and cron in local dev (not on Vercel)
if (!process.env.VERCEL) {
  const { default: cron } = await import('node-cron');
  const { runSummarizer } = await import('./services/aiSummarizer.js');

  // Serve built client in production (local only — Vercel serves static files itself)
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  // Run AI summarizer on the 1st of each month at midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly AI summarizer...');
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthYear = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    try {
      await runSummarizer(monthYear);
      console.log(`AI summary completed for ${monthYear}`);
    } catch (err) {
      console.error('AI summarizer failed:', err);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
