
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qewlxnjqojxprkodfdqf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2x4bmpxb2p4cHJrb2RmZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjE0MTIsImV4cCI6MjA2MDE5NzQxMn0.lADhLBSYqfMPejc840DUUI-ylpihgiuHvHYYiHYnkKQ';

// Create Supabase client - ensuring only ONE instance is created
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
