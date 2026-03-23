-- Avatars bucket + policies (avatars bucket and its policies were created in the partial migration above)
-- Only need the listing policies that failed - but they already exist, so just verify avatars bucket exists
-- The avatars bucket was already created in the partial migration, just need listing upload/delete policies
-- Let's check what's missing by using IF NOT EXISTS pattern

DO $$
BEGIN
  -- Create listing upload policy if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload listing images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own listing images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own listing images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view listing images' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listings');
  END IF;
END $$;