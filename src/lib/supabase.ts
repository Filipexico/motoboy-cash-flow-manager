
import { supabase } from '@/integrations/supabase/client';

// Re-export the supabase client to ensure we use a single instance
export { supabase };

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
