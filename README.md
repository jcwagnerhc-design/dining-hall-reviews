# Blair Academy Dining — Food Review

A web app for Blair Academy's dining hall that lets students and faculty rate food items, write reviews, vote on dining suggestions, and recommend new cuisines/dishes. Admins and staff can manage content, view data with demographic breakdowns, and get AI-powered summaries of recommendations.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Supabase (Postgres)
- **Auth:** JWT (admin/staff only)
- **AI:** Anthropic Claude API (recommendation summarization)

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [Anthropic API key](https://console.anthropic.com) (for AI summarization)

## Setup

### 1. Clone and install dependencies

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `server/db/schema.sql` to create all tables
3. Go to **Settings > API** to find your project URL and keys

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=pick-any-random-string-here
ANTHROPIC_API_KEY=your-anthropic-api-key
PORT=3001
```

### 4. Seed the database

This creates admin/staff accounts, placeholder food items across all tabs, and sample suggestion cards:

```bash
npm run seed
```

### 5. Run the app

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173) concurrently.

Open **http://localhost:5173** in your browser.

## Shutting Down & Restarting

**To stop:** Press `Ctrl+C` in the terminal where it's running.

**To restart:** Open Terminal and run:
```bash
cd ~/Desktop/"Blair Dining Hall Food Review" && npm run dev
```

Then open **http://localhost:5173** in your browser. Your database is in the cloud (Supabase), so all data persists across restarts.

## Login Access

See [CREDENTIALS.md](./CREDENTIALS.md) for all login credentials.

Click **"Admin Login"** in the top-right corner of the site. Admin accounts are redirected to the Admin Panel (`/admin`). Staff accounts are redirected to the Staff View (`/staff`).

### Account Conventions

- Admin usernames: `admin1`, `admin2`, `admin3`, etc.
- Staff usernames: `staff1`, `staff2`, `staff3`, etc.
- Staff accounts are created exclusively by admins in the **Admin Panel > Settings** page.

## How It Works

### Public Site (no login required)

- **Hot Mains / Global Flavors / Desserts tabs:** 12 food items per tab displayed in a 3x4 grid. Click any item to rate it (half-star increments) or write a review.
- **Star ratings:** No login required. One rating per device/IP per item per month.
- **Written reviews:** Require a `@blair.edu` email, graduation year, and optional gender. One review per email per item per month (editable).
- **Suggestions tab:** Vote (upvote/downvote) on dining ideas posted by staff. Recommend cuisines and dishes at the bottom.

### Admin Panel (full access)

- **Overview:** Monthly stats at a glance
- **Manage Items:** Add/edit/delete food items, control which 12 appear in each tab each month
- **Suggestions:** Create/edit/delete suggestion cards for student voting
- **Ratings & Reviews:** View all ratings with distributions, all written reviews with emails, demographic breakdowns by graduation year and gender
- **Historical Data:** Trend charts across months, past rating data, individual past reviews
- **AI Insights:** AI-generated summaries grouping and ranking cuisine/dish recommendations, with manual re-run capability, raw recommendation data
- **Settings:** Create/manage admin and staff accounts

### Staff View (restricted access)

Staff have a simplified dashboard (green sidebar) with the following access:

- **This Month:** Same overview stats as admin
- **Food Items:** Full management (add/edit/delete items, set monthly cycles)
- **Suggestions:** Full management (create/edit/delete suggestion cards, view vote counts)
- **Analytics:** Aggregated rating data with distributions and demographic breakdowns (counts/percentages only)
- **History:** Trend charts and past aggregated rating data
- **AI Insights:** View-only access to AI summaries (cannot trigger re-runs)

**Staff cannot:**
- View any written review text (current or historical)
- View any `@blair.edu` email addresses
- View raw recommendation submissions
- Trigger the AI summarizer manually
- Create, edit, or delete any accounts

## Security

All staff restrictions are enforced **server-side via JWT role claims**. Even if someone inspects the frontend or calls the API directly, restricted endpoints return `403 Forbidden` for staff tokens. This ensures data protection is not dependent on the UI.

## Monthly Cycle

Each month, admins/staff select which 12 food items appear in each tab. Ratings, reviews, and votes are scoped to the current month. At month's end, a cron job automatically runs the AI summarizer on that month's recommendations. All historical data is preserved and accessible.

## Deployment

### Build for production

```bash
npm run build
```

This builds the React frontend into `client/dist/`. The Express server serves these files in production.

### Run in production

```bash
npm start
```

The server serves both the API and the built frontend on the configured PORT.

### Hosting suggestions (free tier)

- **Frontend + Backend:** [Railway](https://railway.app), [Render](https://render.com), or [Fly.io](https://fly.io)
- **Database:** Supabase free tier (500MB, sufficient for this use case)
