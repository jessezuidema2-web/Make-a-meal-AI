-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are readable" ON storage.objects;

-- Policy 1: Users can upload images to their own folder
-- Pattern: bucket/user_id/filename.jpg
CREATE POLICY "Users can upload their own images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ingredient-scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can read their own images
CREATE POLICY "Users can read their own images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ingredient-scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Public bucket - anyone can read
CREATE POLICY "Public images are readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ingredient-scans');

-- Policy 4: Users can delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ingredient-scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
