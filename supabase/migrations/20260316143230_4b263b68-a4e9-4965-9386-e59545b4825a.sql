
-- Stays listings table
CREATE TABLE public.stays_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'guest_house',
  stars INTEGER DEFAULT 0,
  price_per_night NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  lat NUMERIC DEFAULT 7.8731,
  lng NUMERIC DEFAULT 80.7718,
  rooms INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicles listings table
CREATE TABLE public.vehicles_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2024,
  type TEXT NOT NULL DEFAULT 'car',
  price NUMERIC NOT NULL DEFAULT 0,
  price_unit TEXT NOT NULL DEFAULT 'day',
  seats INTEGER DEFAULT 4,
  ac BOOLEAN DEFAULT true,
  driver TEXT DEFAULT 'optional',
  fuel TEXT DEFAULT 'Petrol',
  location TEXT NOT NULL DEFAULT '',
  lat NUMERIC DEFAULT 7.8731,
  lng NUMERIC DEFAULT 80.7718,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events listings table
CREATE TABLE public.events_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'concert',
  venue TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  lat NUMERIC DEFAULT 7.8731,
  lng NUMERIC DEFAULT 80.7718,
  event_date TEXT NOT NULL DEFAULT '',
  event_time TEXT NOT NULL DEFAULT '',
  price_standard NUMERIC DEFAULT 0,
  price_premium NUMERIC DEFAULT 0,
  price_vip NUMERIC DEFAULT 0,
  total_seats INTEGER DEFAULT 100,
  seat_rows INTEGER DEFAULT 10,
  seat_cols INTEGER DEFAULT 10,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stays_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_listings ENABLE ROW LEVEL SECURITY;

-- Stays RLS
CREATE POLICY "Anyone can read stays" ON public.stays_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can insert stays" ON public.stays_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update stays" ON public.stays_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete stays" ON public.stays_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Vehicles RLS
CREATE POLICY "Anyone can read vehicles" ON public.vehicles_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can insert vehicles" ON public.vehicles_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update vehicles" ON public.vehicles_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete vehicles" ON public.vehicles_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events RLS
CREATE POLICY "Anyone can read events" ON public.events_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can insert events" ON public.events_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update events" ON public.events_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete events" ON public.events_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
