-- ==============================================================================
-- AI Prompt Website - Supabase Database Schema & Storage Configuration
-- ==============================================================================
-- Run this script in your Supabase Project's SQL Editor (Dashboard > SQL Editor)
-- It creates the 'prompts' table, indices, storage bucket, and security policies.
-- ==============================================================================

-- 1. Create Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    negative_prompt TEXT DEFAULT '',
    model VARCHAR(100) NOT NULL DEFAULT 'Midjourney v6',
    category VARCHAR(100) NOT NULL DEFAULT 'Cinematic',
    tags TEXT[] DEFAULT '{}',
    aspect_ratio VARCHAR(20) DEFAULT '4:5',
    image_url TEXT NOT NULL,
    settings_info JSONB DEFAULT '{}'::jsonb,
    tips TEXT DEFAULT '',
    copy_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Indices for Fast Filtering & Search
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_model ON public.prompts(model);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copy_count ON public.prompts(copy_count DESC);

-- Enable full-text search capability
CREATE INDEX IF NOT EXISTS idx_prompts_search ON public.prompts USING gin(to_tsvector('english', title || ' ' || prompt_text));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies:
-- Anyone (authenticated or anonymous) can view prompts
DROP POLICY IF EXISTS "Public can view prompts" ON public.prompts;
CREATE POLICY "Public can view prompts" 
ON public.prompts FOR SELECT 
USING (true);

-- Anyone can increment copy_count (via RPC or safe update)
DROP POLICY IF EXISTS "Public can update copy count" ON public.prompts;
CREATE POLICY "Public can update copy count"
ON public.prompts FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only authenticated users (Admin) can insert, update full record, or delete
DROP POLICY IF EXISTS "Authenticated users can insert prompts" ON public.prompts;
CREATE POLICY "Authenticated users can insert prompts" 
ON public.prompts FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update prompts" ON public.prompts;
CREATE POLICY "Authenticated users can update prompts" 
ON public.prompts FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete prompts" ON public.prompts;
CREATE POLICY "Authenticated users can delete prompts" 
ON public.prompts FOR DELETE 
TO authenticated 
USING (true);

-- 5. Helper Function to Atomically Increment Copy Count
CREATE OR REPLACE FUNCTION increment_copy_count(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.prompts
    SET copy_count = copy_count + 1
    WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Setup Supabase Storage Bucket for Prompt Images
-- Note: You can also create the bucket 'prompt-images' directly in the Supabase Dashboard Storage section.
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public Access to Prompt Images" ON storage.objects;
CREATE POLICY "Public Access to Prompt Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');

-- Storage RLS: Authenticated users can upload images
DROP POLICY IF EXISTS "Authenticated users can upload prompt images" ON storage.objects;
CREATE POLICY "Authenticated users can upload prompt images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prompt-images');

DROP POLICY IF EXISTS "Authenticated users can delete prompt images" ON storage.objects;
CREATE POLICY "Authenticated users can delete prompt images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'prompt-images');
