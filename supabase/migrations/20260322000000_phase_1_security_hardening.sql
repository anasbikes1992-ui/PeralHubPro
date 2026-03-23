-- ══════════════════════════════════════════════════════════════
-- PEARL HUB PRO — Phase 1 Security Hardening Migration
-- 2026-03-22
-- ══════════════════════════════════════════════════════════════

-- ── 1. Booking overlap exclusion constraint ────────────────────
-- Requires btree_gist extension for date-range exclusion
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent double-bookings on the same listing
-- for overlapping date ranges with 'confirmed' or 'pending' status.
ALTER TABLE public.bookings
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (
    listing_id WITH =,
    listing_type WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));

-- ── 2. Reviews table (verified bookings only) ─────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL,
  listing_type  TEXT NOT NULL CHECK (listing_type IN ('stay', 'vehicle', 'event', 'property')),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 1000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One review per user per listing
  UNIQUE (user_id, listing_id, listing_type)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Public can read reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only users with a completed booking for this listing can write a review
CREATE POLICY "Only verified bookers can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.user_id      = auth.uid()
        AND b.listing_id   = reviews.listing_id::uuid
        AND b.listing_type = reviews.listing_type
        AND b.status       = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── 3. Seat holds table (event seat reservation with TTL) ─────
CREATE TABLE IF NOT EXISTS public.seat_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seat_index  INTEGER NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, seat_index)
);

ALTER TABLE public.seat_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can hold seats" ON public.seat_holds
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own holds" ON public.seat_holds
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can release own holds" ON public.seat_holds
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Function to clean up expired seat holds
CREATE OR REPLACE FUNCTION public.release_expired_seat_holds()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.seat_holds WHERE expires_at < now();
$$;

-- ── 4. SME businesses table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sme_businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 200),
  description   TEXT DEFAULT '' CHECK (char_length(description) <= 2000),
  category      TEXT NOT NULL DEFAULT 'general',
  location      TEXT NOT NULL DEFAULT '',
  lat           NUMERIC DEFAULT 7.8731,
  lng           NUMERIC DEFAULT 80.7718,
  phone         TEXT DEFAULT '' CHECK (char_length(phone) <= 20),
  email         TEXT DEFAULT '' CHECK (char_length(email) <= 254),
  website       TEXT DEFAULT '' CHECK (char_length(website) <= 500),
  images        TEXT[] DEFAULT '{}',
  verified      BOOLEAN DEFAULT false,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
  active        BOOLEAN NOT NULL DEFAULT true,
  admin_notes   TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sme_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved SME businesses"
  ON public.sme_businesses FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'approved' AND active = true);

CREATE POLICY "Owners can read own businesses"
  ON public.sme_businesses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert businesses"
  ON public.sme_businesses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own businesses"
  ON public.sme_businesses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all businesses"
  ON public.sme_businesses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── 5. SME products table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sme_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES public.sme_businesses(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  description         TEXT DEFAULT '' CHECK (char_length(description) <= 2000),
  price               NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency            TEXT NOT NULL DEFAULT 'LKR' CHECK (char_length(currency) = 3),
  quantity_available  INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  images              TEXT[] DEFAULT '{}',
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sme_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON public.sme_products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Owners can manage own products"
  ON public.sme_products FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Atomic decrement for product inventory (prevents overselling)
CREATE OR REPLACE FUNCTION public.purchase_sme_product(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE public.sme_products
  SET quantity_available = quantity_available - p_quantity,
      updated_at = now()
  WHERE id = p_product_id
    AND quantity_available >= p_quantity
    AND is_active = true;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

-- ── 6. Input length constraints on existing tables ────────────
-- Guard against extremely long inputs reaching the database
DO $$
BEGIN
  -- Stays
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stays_title_length') THEN
    ALTER TABLE public.stays_listings
      ADD CONSTRAINT stays_title_length CHECK (char_length(title) <= 200),
      ADD CONSTRAINT stays_description_length CHECK (char_length(COALESCE(description, '')) <= 3000);
  END IF;

  -- Vehicles
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_title_length') THEN
    ALTER TABLE public.vehicles_listings
      ADD CONSTRAINT vehicles_title_length CHECK (char_length(title) <= 200),
      ADD CONSTRAINT vehicles_description_length CHECK (char_length(COALESCE(description, '')) <= 3000);
  END IF;

  -- Events
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_title_length') THEN
    ALTER TABLE public.events_listings
      ADD CONSTRAINT events_title_length CHECK (char_length(title) <= 200),
      ADD CONSTRAINT events_description_length CHECK (char_length(COALESCE(description, '')) <= 3000);
  END IF;

  -- Properties
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'props_title_length') THEN
    ALTER TABLE public.properties_listings
      ADD CONSTRAINT props_title_length CHECK (char_length(title) <= 200),
      ADD CONSTRAINT props_description_length CHECK (char_length(COALESCE(description, '')) <= 3000);
  END IF;
END;
$$;

-- ── 7. Admin-only function for role promotion ─────────────────
-- Prevents self-promotion to admin via client-side calls
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_target_user_id UUID,
  p_new_role       app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  -- Prevent demoting other admins (safety guard)
  IF p_new_role != 'admin' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_target_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Cannot change role of another admin';
  END IF;

  -- Upsert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user_id, p_new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update the profiles table role field
  UPDATE public.profiles
  SET role = p_new_role, updated_at = now()
  WHERE id = p_target_user_id;

  -- Log the action
  INSERT INTO public.admin_actions (admin_id, action_type, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'role_change',
    'user',
    p_target_user_id,
    jsonb_build_object('new_role', p_new_role)
  );
END;
$$;

-- ── 8. updated_at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'reviews', 'seat_holds', 'sme_businesses', 'sme_products'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

-- ── 9. RLS admin policies for new tables ──────────────────────
CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── 10. Exchange rates table (live rates, updated by Edge Function) ─
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL CHECK (char_length(from_currency) = 3),
  to_currency   TEXT NOT NULL CHECK (char_length(to_currency) = 3),
  rate          NUMERIC NOT NULL CHECK (rate > 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_currency, to_currency)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Rates are public read; only service role (Edge Function) can write
CREATE POLICY "Public can read exchange rates"
  ON public.exchange_rates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed with initial rates (to be kept fresh by a scheduled Edge Function)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
  ('LKR', 'USD', 0.0031),
  ('LKR', 'EUR', 0.0028),
  ('LKR', 'GBP', 0.0024),
  ('LKR', 'RUB', 0.28),
  ('LKR', 'CNY', 0.022),
  ('LKR', 'JPY', 0.46),
  ('USD', 'LKR', 322.58),
  ('EUR', 'LKR', 357.14)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

