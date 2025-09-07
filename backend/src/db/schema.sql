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
  status TEXT NOT NULL, -- 'initiated' | 'successful' | 'failed'
  provider TEXT NOT NULL, -- 'mpesa'
  provider_ref TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- New: payment type for future extensibility
  type TEXT DEFAULT 'ride_safe' -- 'ride_safe' | 'dealstar_fee' | 'flash_deal'
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

-- Add dealstar_points to users table if missing
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='dealstar_points') THEN
    ALTER TABLE users ADD COLUMN dealstar_points INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;
