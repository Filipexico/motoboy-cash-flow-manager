
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qewlxnjqojxprkodfdqf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2x4bmpxb2p4cHJrb2RmZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjE0MTIsImV4cCI6MjA2MDE5NzQxMn0.lADhLBSYqfMPejc840DUUI-ylpihgiuHvHYYiHYnkKQ';

// Create a singleton Supabase client to avoid multiple instances
// This helps prevent "Multiple GoTrueClient" warnings
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'motocontrole-auth-storage-key', // Unique storage key to avoid conflicts
        detectSessionInUrl: true // Ensure redirect handling works
      }
    });
    console.log('Supabase client initialized with proper configuration');
  }
  return supabaseInstance;
})();
