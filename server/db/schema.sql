-- Blair Academy Dining Hall Food Review — Database Schema
-- Run this in the Supabase SQL Editor to set up your database.

-- Admin/staff user accounts
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master list of all food items
CREATE TABLE food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  tab_category VARCHAR(20) NOT NULL CHECK (tab_category IN ('hot_mains', 'global_flavors', 'desserts')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Which food items are active in which month for which tab
CREATE TABLE monthly_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year VARCHAR(7) NOT NULL,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  tab_category VARCHAR(20) NOT NULL CHECK (tab_category IN ('hot_mains', 'global_flavors', 'desserts')),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month_year, food_item_id)
);

-- Star ratings (no auth required, duplicate prevention via IP + fingerprint)
CREATE TABLE star_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  device_fingerprint VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(food_item_id, month_year, ip_address)
);

-- Written reviews (requires blair.edu email)
CREATE TABLE written_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  email VARCHAR(255) NOT NULL,
  graduation_year VARCHAR(20) NOT NULL,
  gender VARCHAR(30) DEFAULT '',
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(food_item_id, month_year, email)
);

-- Suggestion cards (created by admin/staff for voting)
CREATE TABLE suggestion_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year VARCHAR(7) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User votes on suggestion cards
CREATE TABLE suggestion_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_card_id UUID NOT NULL REFERENCES suggestion_cards(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  device_fingerprint VARCHAR(255),
  ip_address VARCHAR(45),
  month_year VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_card_id, ip_address, month_year)
);

-- Free-text cuisine/dish recommendations from users
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year VARCHAR(7) NOT NULL,
  rec_type VARCHAR(10) NOT NULL CHECK (rec_type IN ('cuisine', 'dish')),
  text TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated summaries of recommendations
CREATE TABLE ai_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year VARCHAR(7) NOT NULL,
  summary_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_monthly_cycles_month ON monthly_cycles(month_year);
CREATE INDEX idx_monthly_cycles_active ON monthly_cycles(month_year, is_active);
CREATE INDEX idx_star_ratings_item_month ON star_ratings(food_item_id, month_year);
CREATE INDEX idx_star_ratings_ip ON star_ratings(ip_address, food_item_id, month_year);
CREATE INDEX idx_written_reviews_item_month ON written_reviews(food_item_id, month_year);
CREATE INDEX idx_written_reviews_email ON written_reviews(email, food_item_id, month_year);
CREATE INDEX idx_suggestion_cards_month ON suggestion_cards(month_year);
CREATE INDEX idx_suggestion_votes_card ON suggestion_votes(suggestion_card_id);
CREATE INDEX idx_suggestion_votes_ip ON suggestion_votes(ip_address, suggestion_card_id, month_year);
CREATE INDEX idx_recommendations_month ON recommendations(month_year);
CREATE INDEX idx_ai_summaries_month ON ai_summaries(month_year);

-- Enable Row Level Security (optional, can be configured later)
-- ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE star_ratings ENABLE ROW LEVEL SECURITY;
-- etc.
