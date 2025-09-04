-- PostgreSQL schema for CarRescueKe

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Ensure role is constrained
ALTER TABLE users
  ADD CONSTRAINT IF NOT EXISTS users_role_check
  CHECK (role IN ('buyer','seller','admin'));

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
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- store phone or external id; no FK
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount_kes INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'initiated' | 'successful' | 'failed'
  provider TEXT NOT NULL, -- 'mpesa'
  provider_ref TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
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