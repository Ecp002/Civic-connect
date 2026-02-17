-- ============================================
-- CivicConnect UPGRADE Script
-- Run this if you already have the old schema
-- ============================================

-- Step 1: Rename old image_url to before_image_url (if image_url exists and before_image_url doesn't)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='image_url') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='before_image_url') THEN
        ALTER TABLE issues RENAME COLUMN image_url TO before_image_url;
    END IF;
END $$;

-- Step 2: Add new columns to existing issues table (only if they don't exist)
ALTER TABLE issues ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS before_image_url TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS after_image_url TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS processing_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS feedback_text TEXT;

-- Step 3: Add satisfaction columns with constraints
DO $$
BEGIN
    -- Add satisfaction_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='satisfaction_status') THEN
        ALTER TABLE issues ADD COLUMN satisfaction_status TEXT;
    END IF;
    
    -- Add satisfaction_rating if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='satisfaction_rating') THEN
        ALTER TABLE issues ADD COLUMN satisfaction_rating INTEGER;
    END IF;
END $$;

-- Step 4: Update constraints
-- Drop old constraints if they exist
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_satisfaction_status_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_satisfaction_rating_check;

-- Add new constraints
ALTER TABLE issues ADD CONSTRAINT issues_status_check 
    CHECK (status IN ('Reported', 'Processing', 'Resolved', 'In Progress'));

ALTER TABLE issues ADD CONSTRAINT issues_satisfaction_status_check 
    CHECK (satisfaction_status IN ('Satisfied', 'Not Satisfied') OR satisfaction_status IS NULL);

ALTER TABLE issues ADD CONSTRAINT issues_satisfaction_rating_check 
    CHECK ((satisfaction_rating >= 1 AND satisfaction_rating <= 5) OR satisfaction_rating IS NULL);

-- Step 5: Migrate old 'In Progress' status to 'Processing' (optional)
UPDATE issues SET status = 'Processing' WHERE status = 'In Progress';

-- ============================================
-- UPGRADE COMPLETE!
-- ============================================
-- You can now use the upgraded CivicConnect system
-- All existing data has been preserved
