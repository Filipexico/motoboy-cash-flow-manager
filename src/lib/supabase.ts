
import { createClient } from '@supabase/supabase-js';

// Using the credentials directly to avoid dependency on environment variables
const SUPABASE_URL = 'https://qewlxnjqojxprkodfdqf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2x4bmpxb2p4cHJrb2RmZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjE0MTIsImV4cCI6MjA2MDE5NzQxMn0.lADhLBSYqfMPejc840DUUI-ylpihgiuHvHYYiHYnkKQ';

// Configure the Supabase client with persistence options
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Export for easy access to check authentication status
export const getSessionStatus = async () => {
  try {
    console.log('Checking session status...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    console.log('Session status:', data.session ? 'Active' : 'No active session');
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error in getSessionStatus:', error);
    return { session: null, error };
  }
};

// Debug function to log current auth state
export const logAuthState = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current auth state:', session ? 'Authenticated' : 'Not authenticated');
  if (session) {
    console.log('User ID:', session.user.id);
    console.log('User email:', session.user.email);
  }
  return session;
};

console.log('Supabase client initialized with proper configuration');
