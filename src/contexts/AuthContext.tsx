
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define types
type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  displayName?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  checkSubscription: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sample user data (in a real app, this would come from your auth system)
const mockUsers = [
  { 
    id: 'user1', 
    email: 'user@example.com',
    password: 'password', 
    isAdmin: false, 
    isSubscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    displayName: 'Usuário Teste' 
  },
  { 
    id: 'admin1', 
    email: 'admin@example.com',
    password: 'admin', 
    isAdmin: true, 
    isSubscribed: true,
    subscriptionTier: 'premium',
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    displayName: 'Admin' 
  }
];

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          return;
        }

        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            isAdmin: session.user.app_metadata?.role === 'admin',
            isSubscribed: userProfile?.subscribed || false,
            subscriptionTier: userProfile?.subscription_tier || null,
            subscriptionEnd: userProfile?.subscription_end || null,
            displayName: session.user.user_metadata?.display_name || session.user.email
          });
          
          // Check subscription status
          checkSubscription();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth effect error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          const { data: userProfile } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            isAdmin: session.user.app_metadata?.role === 'admin',
            isSubscribed: userProfile?.subscribed || false,
            subscriptionTier: userProfile?.subscription_tier || null,
            subscriptionEnd: userProfile?.subscription_end || null,
            displayName: session.user.user_metadata?.display_name || session.user.email
          });
          
          // Check subscription status
          checkSubscription();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check subscription status
  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      if (data) {
        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            isSubscribed: data.subscribed || false,
            subscriptionTier: data.subscription_tier,
            subscriptionEnd: data.subscription_end
          };
        });
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Context value
  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    checkSubscription,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
