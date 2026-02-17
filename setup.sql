-- ============================================
-- CivicConnect Database Setup
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. CREATE PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Anyone can insert their profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);


-- 2. CREATE ISSUES TABLE (UPGRADED)
-- ============================================

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    area TEXT,
    category TEXT NOT NULL,
    
    -- Geo-location fields
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Before/After proof system
    before_image_url TEXT,
    after_image_url TEXT,
    
    -- Status with Processing stage
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Processing', 'Resolved')),
    
    -- Timeline tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Citizen satisfaction
    satisfaction_status TEXT CHECK (satisfaction_status IN ('Satisfied', 'Not Satisfied')),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback_text TEXT
);

-- Enable Row Level Security
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Policies for issues
CREATE POLICY "Anyone can view issues"
    ON issues FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create issues"
    ON issues FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues"
    ON issues FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any issue"
    ON issues FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );


-- 3. STORAGE POLICIES FOR 'myfiles' BUCKET
-- ============================================
-- Note: Ensure the 'myfiles' bucket exists in Storage
-- Go to Storage > Create bucket > Name: myfiles > Public: YES

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'myfiles' AND
        auth.role() = 'authenticated'
    );

-- Allow public access to view images
CREATE POLICY "Public can view images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'myfiles');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'myfiles' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );


-- 4. CREATE ADMIN USER (MANUAL STEP)
-- ============================================
-- After creating a user in Authentication > Users dashboard,
-- run ONE of these queries:

-- Option A: Insert new admin profile (replace YOUR_USER_UUID)
-- INSERT INTO profiles (id, full_name, email, role)
-- VALUES (
--     'YOUR_USER_UUID',
--     'Admin User',
--     'admin@civicconnect.com',
--     'admin'
-- );

-- Option B: Update existing user to admin (replace email)
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';


-- ============================================
-- SETUP COMPLETE!
-- ============================================
