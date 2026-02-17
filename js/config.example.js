// Supabase Configuration
// Copy this file to config.js and update with your actual credentials

const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here',
    storageBucket: 'myfiles'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

const STORAGE_BUCKET = SUPABASE_CONFIG.storageBucket;
