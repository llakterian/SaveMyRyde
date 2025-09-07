-- PostgreSQL schema for SaveMyRyde

-- Enable pgcrypto for gen_random_uuid (if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'buyer', -- 'buyer' | 'seller' | 'admin'
  seller_id_number TEXT,
  kra_pin TEXT,
  dealstar_fee_paid_at TIMESTAMPTZ,
  kyc_status TEXT NOT NULL DEFAULT 'unverified', -- 'unverified' | 'pending' | 'verified' | 'rejected'
  id_verified_at TIMESTAMPTZ,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  subscription_tier TEXT NOT NULL DEFAULT 'basic', -- 'basic' | 'premium' | 'vip'
  subscription_expires_at TIMESTAMPTZ,
  total_spent_kes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Ensure role is constrained
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('buyer','seller','admin'));
  END IF;
  -- Add dealstar_fee_paid_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='dealstar_fee_paid_at'
  ) THEN
    ALTER TABLE users ADD COLUMN dealstar_fee_paid_at TIMESTAMPTZ;
  END IF;
  -- Add kyc_status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='kyc_status'
  ) THEN
    ALTER TABLE users ADD COLUMN kyc_status TEXT NOT NULL DEFAULT 'unverified';
  END IF;
  -- Add id_verified_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='id_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN id_verified_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- store phone or external id; no FK
  contact_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_kes INTEGER NOT NULL,
  location TEXT NOT NULL,
  county TEXT,
  town TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_payment', -- 'draft' | 'pending_payment' | 'active' | 'sold' | 'hidden' | 'expired'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  -- New fields for MVP
  min_price_kes INTEGER,
  auction_deadline TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'unverified', -- 'unverified' | 'pending' | 'verified' | 'rejected'
  badges TEXT[] DEFAULT '{}',
  is_flash_deal BOOLEAN DEFAULT FALSE,
  ride_safe_paid_at TIMESTAMPTZ,
  flash_deal_paid_at TIMESTAMPTZ,
  valuation_report_url TEXT
);

-- Backfill/alter for existing databases (idempotent guards)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='min_price_kes') THEN
    ALTER TABLE listings ADD COLUMN min_price_kes INTEGER;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='auction_deadline') THEN
    ALTER TABLE listings ADD COLUMN auction_deadline TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='verification_status') THEN
    ALTER TABLE listings ADD COLUMN verification_status TEXT DEFAULT 'unverified';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='badges') THEN
    ALTER TABLE listings ADD COLUMN badges TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='is_flash_deal') THEN
    ALTER TABLE listings ADD COLUMN is_flash_deal BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='ride_safe_paid_at') THEN
    ALTER TABLE listings ADD COLUMN ride_safe_paid_at TIMESTAMPTZ;
  END IF;
  -- Add flash_deal_paid_at column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='flash_deal_paid_at') THEN
    ALTER TABLE listings ADD COLUMN flash_deal_paid_at TIMESTAMPTZ;
  END IF;
  -- Add valuation_report_url column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='valuation_report_url') THEN
    ALTER TABLE listings ADD COLUMN valuation_report_url TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- store phone or external id; no FK
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount_kes INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'initiated' | 'successful' | 'failed' | 'pending' | 'cancelled'
  provider TEXT NOT NULL, -- 'card' | 'mobile_money' | 'bank_transfer' | 'crypto' | 'credits'
  provider_ref TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Payment type for different services
  type TEXT DEFAULT 'listing_fee', -- 'listing_fee' | 'premium_listing' | 'credits_purchase' | 'subscription' | 'flash_deal' | 'verification'
  -- Additional fields for modern payment tracking
  payment_intent_id TEXT,
  fees_kes INTEGER DEFAULT 0,
  net_amount_kes INTEGER,
  currency TEXT DEFAULT 'KES',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0
);

DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='type') THEN
    ALTER TABLE payments ADD COLUMN type TEXT DEFAULT 'ride_safe';
  END IF;
END $$;

-- Offers table for bids/direct offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL, -- phone or external id; no FK
  amount_kes INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'offer', -- 'offer' | 'bid'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'outbid'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'featured' | 'homepage' | 'boost'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_kes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_payments_listing ON payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_verification_requests_listing ON verification_requests(listing_id);

-- Table to log DealStar transactions (fees, refunds, points earned/redeemed)
CREATE TABLE IF NOT EXISTS dealstar_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'fee_paid' | 'fee_refunded' | 'points_earned' | 'points_redeemed'
  amount_kes INTEGER, -- for fee/refund
  points INTEGER, -- for points earned/redeemed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tables for DealStar Raffles
CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
  winner_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raffle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit transactions table for tracking all credit movements
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'earned' | 'spent' | 'bonus' | 'refund' | 'expired'
  amount INTEGER NOT NULL, -- positive for credits added, negative for credits spent
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'payment_cashback' | 'referral' | 'purchase' | 'listing_fee' | 'admin_adjustment'
  reference_id UUID, -- payment_id, listing_id, etc.
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'basic' | 'premium' | 'vip'
  price_kes INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  max_listings INTEGER,
  priority_support BOOLEAN DEFAULT FALSE,
  verification_included BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  payment_id UUID REFERENCES payments(id),
  status TEXT NOT NULL, -- 'active' | 'expired' | 'cancelled'
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral system table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL,
  referred_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'completed' | 'credited'
  reward_credits INTEGER DEFAULT 1000,
  completed_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Vehicle verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  user_id TEXT NOT NULL,
  payment_id UUID REFERENCES payments(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'failed'
  verification_type TEXT NOT NULL, -- 'basic' | 'comprehensive' | 'premium'
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verifier_name TEXT,
  report_url TEXT,
  findings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add dealstar_points to users table if missing
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='dealstar_points') THEN
    ALTER TABLE users ADD COLUMN dealstar_points INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_kes, duration_days, features, max_listings, priority_support, verification_included)
VALUES
  ('Basic Plan', 'basic', 0, 30, '{"listings_per_month": 2, "photo_limit": 5, "basic_support": true}', 2, FALSE, FALSE),
  ('Premium Plan', 'premium', 2500, 30, '{"listings_per_month": 10, "photo_limit": 15, "priority_placement": true, "analytics": true}', 10, TRUE, TRUE),
  ('VIP Plan', 'vip', 5000, 30, '{"unlimited_listings": true, "unlimited_photos": true, "featured_placement": true, "dedicated_support": true, "market_insights": true}', -1, TRUE, TRUE)
ON CONFLICT DO NOTHING;
  -- Add credits_balance column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='credits_balance') THEN
    ALTER TABLE users ADD COLUMN credits_balance INTEGER NOT NULL DEFAULT 0;
  END IF;
  -- Add subscription_tier column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_tier') THEN
    ALTER TABLE users ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'basic';
  END IF;
  -- Add subscription_expires_at column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_expires_at') THEN
    ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMPTZ;
  END IF;
  -- Add total_spent_kes column if missing
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_spent_kes') THEN
    ALTER TABLE users ADD COLUMN total_spent_kes INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;
