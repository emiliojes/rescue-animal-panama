-- Create storage bucket for case photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'case-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
