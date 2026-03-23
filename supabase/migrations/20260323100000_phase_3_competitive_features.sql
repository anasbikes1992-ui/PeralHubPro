-- ══════════════════════════════════════════════════════════════
-- PEARL HUB PRO — Phase 3: Competitive Features Migration
-- 2026-03-23
-- ══════════════════════════════════════════════════════════════

-- ── 1. Booking messages (multilingual real-time chat) ─────────
CREATE TABLE IF NOT EXISTS public.booking_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name   TEXT NOT NULL DEFAULT '',
  sender_lang   TEXT NOT NULL DEFAULT 'en',
  original_text TEXT NOT NULL CHECK (char_length(original_text) BETWEEN 1 AND 1000),
  translations  JSONB NOT NULL DEFAULT '{}',
  is_voice      BOOLEAN DEFAULT false,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

-- Parties to a booking can read its messages
CREATE POLICY "Booking parties can read messages"
  ON public.booking_messages FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
    OR booking_id IN (
      SELECT b.id FROM public.bookings b
      WHERE b.listing_id IN (
        SELECT id FROM public.stays_listings    WHERE user_id = auth.uid() UNION
        SELECT id FROM public.vehicles_listings WHERE user_id = auth.uid() UNION
        SELECT id FROM public.events_listings   WHERE user_id = auth.uid() UNION
        SELECT id FROM public.properties_listings WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Booking parties can send messages"
  ON public.booking_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- ── 2. Blocked dates (provider availability management) ──────
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_date  DATE NOT NULL,
  reason        TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, blocked_date)
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read blocked dates"
  ON public.blocked_dates FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owners can manage their blocked dates"
  ON public.blocked_dates FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Pearl Points loyalty table ────────────────────────────
CREATE TABLE IF NOT EXISTS public.pearl_points (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned   INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
  balance        INTEGER GENERATED ALWAYS AS (total_earned - total_redeemed) STORED,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pearl_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own points"
  ON public.pearl_points FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all points"
  ON public.pearl_points FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Function: award points after booking completion
CREATE OR REPLACE FUNCTION public.award_pearl_points(
  p_user_id   UUID,
  p_amount    NUMERIC -- booking total in LKR
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pts INTEGER := FLOOR(p_amount / 100); -- 1 pt per Rs. 100
BEGIN
  INSERT INTO public.pearl_points (user_id, total_earned)
  VALUES (p_user_id, pts)
  ON CONFLICT (user_id) DO UPDATE
    SET total_earned = pearl_points.total_earned + pts,
        updated_at   = now();
END;
$$;

-- Function: redeem points at checkout
CREATE OR REPLACE FUNCTION public.redeem_pearl_points(
  p_user_id UUID,
  p_points  INTEGER
)
RETURNS NUMERIC -- LKR value
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  balance INTEGER;
  lkr_value NUMERIC;
BEGIN
  SELECT pearl_points.balance INTO balance
  FROM public.pearl_points WHERE user_id = p_user_id;

  IF balance IS NULL OR balance < p_points THEN
    RAISE EXCEPTION 'Insufficient Pearl Points';
  END IF;

  lkr_value := FLOOR(p_points * 0.8); -- 1 pt = Rs. 0.80

  UPDATE public.pearl_points
  SET total_redeemed = total_redeemed + p_points,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN lkr_value;
END;
$$;

-- Trigger: award points when booking is marked completed
CREATE OR REPLACE FUNCTION public.handle_booking_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.award_pearl_points(NEW.user_id, NEW.total_amount);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_booking_completed ON public.bookings;
CREATE TRIGGER trg_booking_completed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_completed();

-- ── 4. Provider verification tiers ───────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider_tier') THEN
    ALTER TABLE public.profiles
      ADD COLUMN provider_tier TEXT DEFAULT 'standard'
        CHECK (provider_tier IN ('standard', 'verified', 'pro', 'elite')),
      ADD COLUMN sltda_number TEXT DEFAULT '',
      ADD COLUMN total_bookings INTEGER DEFAULT 0,
      ADD COLUMN avg_rating NUMERIC DEFAULT 0,
      ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Function: recalculate provider tier
CREATE OR REPLACE FUNCTION public.update_provider_tier(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bk_count INTEGER;
  avg_rat  NUMERIC;
  new_tier TEXT := 'standard';
BEGIN
  SELECT COUNT(*), COALESCE(AVG(r.rating), 0)
  INTO bk_count, avg_rat
  FROM public.bookings b
  LEFT JOIN public.reviews r ON r.user_id = b.user_id
  WHERE b.listing_id IN (
    SELECT id FROM public.stays_listings    WHERE user_id = p_user_id UNION
    SELECT id FROM public.vehicles_listings WHERE user_id = p_user_id UNION
    SELECT id FROM public.events_listings   WHERE user_id = p_user_id
  ) AND b.status = 'completed';

  IF bk_count >= 100 AND avg_rat >= 4.8 THEN new_tier := 'elite';
  ELSIF bk_count >= 50 AND avg_rat >= 4.5 THEN new_tier := 'pro';
  ELSIF bk_count >= 5 THEN new_tier := 'verified';
  END IF;

  UPDATE public.profiles
  SET provider_tier  = new_tier,
      total_bookings = bk_count,
      avg_rating     = ROUND(avg_rat::numeric, 2),
      updated_at     = now()
  WHERE id = p_user_id;
END;
$$;

-- ── 5. Referral / affiliate system ───────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code   TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_lkr      INTEGER DEFAULT 500, -- Rs. 500 wallet credit on first booking
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- Auto-generate referral code for new profiles
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'PH-' || UPPER(SUBSTR(MD5(p_user_id::text || now()::text), 1, 6));
  INSERT INTO public.referrals (referrer_id, referral_code, status)
  VALUES (p_user_id, code, 'pending')
  ON CONFLICT DO NOTHING;
  RETURN code;
END;
$$;

-- ── 6. Damage deposit / escrow ────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'damage_deposit') THEN
    ALTER TABLE public.bookings
      ADD COLUMN damage_deposit    NUMERIC DEFAULT 0,
      ADD COLUMN deposit_status    TEXT DEFAULT 'none'
        CHECK (deposit_status IN ('none','held','released','claimed','refunded')),
      ADD COLUMN deposit_release_at TIMESTAMPTZ,
      ADD COLUMN deposit_claim_reason TEXT DEFAULT '';
  END IF;
END $$;

-- Scheduled function: auto-release deposits 24h after check-out
CREATE OR REPLACE FUNCTION public.auto_release_deposits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
  SET deposit_status = 'released',
      updated_at     = now()
  WHERE deposit_status = 'held'
    AND deposit_release_at < now()
    AND status = 'completed';
END;
$$;

-- ── 7. iCal export tokens ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ical_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ical_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own iCal tokens"
  ON public.ical_tokens FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 8. Enable Realtime on booking_messages ────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_dates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ── 9. Preferred language on profiles ────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_language') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- ── 10. Full-text search index (Sinhala/Tamil/English) ────────
-- Note: pg_trgm supports any unicode string via trigrams
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_stays_title_trgm    ON public.stays_listings    USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vehicles_title_trgm ON public.vehicles_listings USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_title_trgm   ON public.events_listings   USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_props_title_trgm    ON public.properties_listings USING gin (title gin_trgm_ops);

-- Unified search function across all listing types
CREATE OR REPLACE FUNCTION public.search_all_listings(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id TEXT, title TEXT, listing_type TEXT, location TEXT,
  price NUMERIC, image TEXT, rating NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id::text, name as title, 'stay' as listing_type, location,
         price_per_night as price, COALESCE(images[1], '') as image, rating
  FROM public.stays_listings
  WHERE moderation_status = 'approved' AND active = true
    AND (title ILIKE '%' || p_query || '%' OR location ILIKE '%' || p_query || '%' OR name ILIKE '%' || p_query || '%')
  LIMIT p_limit / 4

  UNION ALL

  SELECT id::text, title, 'vehicle', location, price_per_day, COALESCE(images[1], ''), rating
  FROM public.vehicles_listings
  WHERE moderation_status = 'approved' AND active = true
    AND (title ILIKE '%' || p_query || '%' OR location ILIKE '%' || p_query || '%')
  LIMIT p_limit / 4

  UNION ALL

  SELECT id::text, title, 'event', location, COALESCE(price_standard, 0), COALESCE(images[1], ''), 0
  FROM public.events_listings
  WHERE moderation_status = 'approved' AND active = true
    AND (title ILIKE '%' || p_query || '%' OR location ILIKE '%' || p_query || '%' OR venue ILIKE '%' || p_query || '%')
  LIMIT p_limit / 4

  UNION ALL

  SELECT id::text, title, 'property', location, price, COALESCE(images[1], ''), 0
  FROM public.properties_listings
  WHERE moderation_status = 'approved' AND active = true
    AND (title ILIKE '%' || p_query || '%' OR location ILIKE '%' || p_query || '%')
  LIMIT p_limit / 4;
$$;

-- ── 11. Payment gateway audit log ─────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gateway       TEXT NOT NULL CHECK (gateway IN ('payhere', 'lankapay', 'webxpay')),
  method        TEXT NOT NULL CHECK (method IN ('card', 'bank', 'mobile')),
  amount        NUMERIC NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'LKR',
  status        TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'processing', 'succeeded', 'failed', 'refunded')),
  gateway_ref   TEXT DEFAULT '',
  initiated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payment attempts"
  ON public.payment_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all payment attempts"
  ON public.payment_attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_payment_attempts_user ON public.payment_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_booking ON public.payment_attempts (booking_id);
