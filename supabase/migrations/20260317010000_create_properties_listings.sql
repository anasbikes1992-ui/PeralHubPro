
-- Create properties listings table (for Sales / Rentals)
CREATE TABLE public.properties_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'sale', -- sale / rent / lease
  subtype TEXT DEFAULT 'house',
  price NUMERIC NOT NULL DEFAULT 0,
  beds INTEGER DEFAULT 0,
  baths INTEGER DEFAULT 0,
  area NUMERIC DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  lat NUMERIC DEFAULT 7.8731,
  lng NUMERIC DEFAULT 80.7718,
  images TEXT[] DEFAULT '{}',
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected','suspended')),
  active BOOLEAN NOT NULL DEFAULT true,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved active properties" ON public.properties_listings FOR SELECT TO anon, authenticated USING (moderation_status = 'approved' AND active = true);
CREATE POLICY "Owners can read their properties" ON public.properties_listings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert properties" ON public.properties_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update properties" ON public.properties_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete properties" ON public.properties_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin can see all properties
CREATE POLICY "Admins can read all properties" ON public.properties_listings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update any property" ON public.properties_listings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete any property" ON public.properties_listings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
