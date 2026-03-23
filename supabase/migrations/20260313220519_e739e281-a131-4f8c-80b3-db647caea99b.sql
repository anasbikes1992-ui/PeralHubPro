
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  listing_type text NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text DEFAULT '',
  message text DEFAULT '',
  owner_id uuid DEFAULT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries"
ON public.inquiries FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read their own inquiries"
ON public.inquiries FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can update their own inquiries"
ON public.inquiries FOR UPDATE TO authenticated
USING (owner_id = auth.uid());
