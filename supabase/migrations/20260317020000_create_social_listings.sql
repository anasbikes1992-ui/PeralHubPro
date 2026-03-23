-- Create social listings table (for SME businesses)
CREATE TABLE public.social_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tourism',
  description TEXT DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  lat NUMERIC DEFAULT 7.8731,
  lng NUMERIC DEFAULT 80.7718,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  fee TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected','suspended')),
  active BOOLEAN NOT NULL DEFAULT true,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved active social listings" ON public.social_listings FOR SELECT TO anon, authenticated USING (moderation_status = 'approved' AND active = true);
CREATE POLICY "Owners can read their social listings" ON public.social_listings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert social listings" ON public.social_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update social listings" ON public.social_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete social listings" ON public.social_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin can see all social listings
CREATE POLICY "Admins can read all social listings" ON public.social_listings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update any social listing" ON public.social_listings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete any social listing" ON public.social_listings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));