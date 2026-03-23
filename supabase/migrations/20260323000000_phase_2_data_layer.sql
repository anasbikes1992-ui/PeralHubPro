-- ══════════════════════════════════════════════════════════════
-- PEARL HUB PRO — Phase 2 Data Layer Migration
-- 2026-03-23
-- Adds missing columns and indexes needed by the React Query hooks
-- ══════════════════════════════════════════════════════════════

-- ── 1. Add stay_type column to stays_listings if missing ──────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stays_listings' AND column_name = 'stay_type'
  ) THEN
    ALTER TABLE public.stays_listings ADD COLUMN stay_type TEXT DEFAULT 'hotel';
  END IF;
END $$;

-- ── 2. Add vehicle_type column to vehicles_listings if missing ─
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles_listings' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.vehicles_listings ADD COLUMN vehicle_type TEXT DEFAULT 'car';
  END IF;
END $$;

-- ── 3. Add with_driver column to vehicles_listings if missing ──
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles_listings' AND column_name = 'with_driver'
  ) THEN
    ALTER TABLE public.vehicles_listings ADD COLUMN with_driver BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ── 4. Performance indexes for common filter queries ──────────
CREATE INDEX IF NOT EXISTS idx_stays_moderation_active
  ON public.stays_listings (moderation_status, active)
  WHERE moderation_status = 'approved' AND active = true;

CREATE INDEX IF NOT EXISTS idx_stays_location
  ON public.stays_listings USING gin (to_tsvector('english', location));

CREATE INDEX IF NOT EXISTS idx_vehicles_moderation_active
  ON public.vehicles_listings (moderation_status, active)
  WHERE moderation_status = 'approved' AND active = true;

CREATE INDEX IF NOT EXISTS idx_events_moderation_active_date
  ON public.events_listings (moderation_status, active, event_date)
  WHERE moderation_status = 'approved' AND active = true;

CREATE INDEX IF NOT EXISTS idx_properties_moderation_active
  ON public.properties_listings (moderation_status, active)
  WHERE moderation_status = 'approved' AND active = true;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id
  ON public.bookings (user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_id
  ON public.bookings (listing_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id
  ON public.wallet_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_listing
  ON public.reviews (listing_id, listing_type);

-- ── 5. Profiles: ensure vehicle_provider role exists in enum ──
-- (app_role enum was created with event_organizer, but the app uses
--  vehicle_provider — we add it if it doesn't already exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.app_role'::regtype
      AND enumlabel = 'vehicle_provider'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'vehicle_provider';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.app_role'::regtype
      AND enumlabel = 'event_provider'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'event_provider';
  END IF;
END $$;

-- ── 6. handle_new_user: set role from signup metadata ────────
-- Override the existing trigger function to also insert a user_role row
-- based on the role passed in raw_user_meta_data during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role := 'customer';
BEGIN
  -- Safely parse the role from metadata; default to customer
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::app_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'customer';
  END;

  -- Prevent self-promotion to admin via signup metadata
  IF v_role = 'admin' THEN
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Re-attach trigger (drop and recreate to pick up the new function body)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 7. Function: check if user can review a listing ──────────
CREATE OR REPLACE FUNCTION public.can_review_listing(
  p_user_id    UUID,
  p_listing_id UUID,
  p_listing_type TEXT
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id      = p_user_id
      AND listing_id   = p_listing_id
      AND listing_type = p_listing_type
      AND status       = 'completed'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.reviews
    WHERE user_id      = p_user_id
      AND listing_id   = p_listing_id
      AND listing_type = p_listing_type
  );
$$;
