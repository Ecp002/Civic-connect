# CivicConnect - Supabase SQL Setup

Run these SQL queries in your Supabase SQL Editor (in order):

## 1. Create Profiles Table

```sql
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
```

## 2. Create Issues Table

```sql
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Progress', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
```

## 3. Create Storage Bucket (if not already created)

Go to Storage in Supabase Dashboard and ensure bucket "myfiles" exists with:
- Public bucket: YES
- File size limit: 5MB
- Allowed MIME types: image/*

## 4. Storage Policies

```sql
-- Allow authenticated users to upload
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
```

## 5. Create Admin User

After running the above queries, create an admin account:

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User" and create a user with email/password
3. Copy the user's UUID
4. Run this SQL query (replace YOUR_USER_UUID with the actual UUID):

```sql
INSERT INTO profiles (id, full_name, email, role)
VALUES (
    'YOUR_USER_UUID',
    'Admin User',
    'admin@civicconnect.com',
    'admin'
);
```

OR update an existing user to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

## Setup Complete!

Your CivicConnect application is now ready to use.
