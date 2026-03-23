-- PHASE 0: Security & Admin Foundations Migration

-- Add moderation status to listings tables
ALTER TABLE public.stays_listings ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE public.vehicles_listings ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE public.events_listings ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add admin notes
ALTER TABLE public.stays_listings ADD COLUMN admin_notes TEXT DEFAULT '';
ALTER TABLE public.vehicles_listings ADD COLUMN admin_notes TEXT DEFAULT '';
ALTER TABLE public.events_listings ADD COLUMN admin_notes TEXT DEFAULT '';

-- Provider verification badges
ALTER TABLE public.profiles ADD COLUMN verification_badges TEXT[] DEFAULT '{}';

-- User reports table
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID,
  listing_type TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'fraud', 'inappropriate', 'fake_listing', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limiting table
CREATE TABLE public.request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin actions log
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'listing', etc.
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can report" ON public.user_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can read all reports" ON public.user_reports FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update reports" ON public.user_reports FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read request logs" ON public.request_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read admin actions" ON public.admin_actions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') AND auth.uid() = admin_id);

-- Add active status to listings tables
ALTER TABLE public.stays_listings ADD COLUMN active BOOLEAN DEFAULT true;
ALTER TABLE public.vehicles_listings ADD COLUMN active BOOLEAN DEFAULT true;
ALTER TABLE public.events_listings ADD COLUMN active BOOLEAN DEFAULT true;

-- Add admin status reason
ALTER TABLE public.stays_listings ADD COLUMN admin_status_reason TEXT DEFAULT '';
ALTER TABLE public.vehicles_listings ADD COLUMN admin_status_reason TEXT DEFAULT '';
ALTER TABLE public.events_listings ADD COLUMN admin_status_reason TEXT DEFAULT '';

-- Bookings table for analytics
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('stay', 'vehicle', 'event')),
  booking_date DATE NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LKR',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Earnings table
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LKR',
  commission NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User languages tracking
CREATE TABLE public.user_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT DEFAULT 'basic' CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'native')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, language)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Providers can view bookings for their listings" ON public.bookings FOR SELECT TO authenticated USING (
  listing_id IN (
    SELECT id FROM public.stays_listings WHERE user_id = auth.uid()
    UNION
    SELECT id FROM public.vehicles_listings WHERE user_id = auth.uid()
    UNION
    SELECT id FROM public.events_listings WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view own earnings" ON public.earnings FOR SELECT TO authenticated USING (provider_id = auth.uid());

CREATE POLICY "Users can manage own languages" ON public.user_languages FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Update RLS to only show approved and active listings to public
DROP POLICY "Anyone can read approved stays" ON public.stays_listings;
CREATE POLICY "Anyone can read approved active stays" ON public.stays_listings FOR SELECT TO anon, authenticated USING (moderation_status = 'approved' AND active = true);

DROP POLICY "Anyone can read approved vehicles" ON public.vehicles_listings;
CREATE POLICY "Anyone can read approved active vehicles" ON public.vehicles_listings FOR SELECT TO anon, authenticated USING (moderation_status = 'approved' AND active = true);

DROP POLICY "Anyone can read approved events" ON public.events_listings;
CREATE POLICY "Anyone can read approved active events" ON public.events_listings FOR SELECT TO anon, authenticated USING (moderation_status = 'approved' AND active = true);