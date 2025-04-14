
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
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
            subscriptionEndDate: userProfile?.subscription_end || null, // For backward compatibility
            displayName: session.user.user_metadata?.display_name || session.user.email,
            name: session.user.user_metadata?.display_name || session.user.email, // For backward compatibility
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
          try {
            // Check if user exists in subscribers table
            const { data: userProfile } = await supabase
              .from('subscribers')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            // If this is a new user (no subscriber record), create default data
            if (!userProfile) {
              console.log('New user detected - setting up default data');
              await setupNewUserData(session.user.id);
            }

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              isAdmin: session.user.app_metadata?.role === 'admin',
              isSubscribed: userProfile?.subscribed || false,
              subscriptionTier: userProfile?.subscription_tier || null,
              subscriptionEnd: userProfile?.subscription_end || null,
              subscriptionEndDate: userProfile?.subscription_end || null, // For backward compatibility
              displayName: session.user.user_metadata?.display_name || session.user.email,
              name: session.user.user_metadata?.display_name || session.user.email, // For backward compatibility
            });
            
            // Check subscription status
            checkSubscription();
          } catch (error) {
            console.error('Error setting up user data:', error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to set up default data for new users
  const setupNewUserData = async (userId: string) => {
    try {
      // Create a subscriber record
      await supabase.from('subscribers').insert({
        user_id: userId,
        email: user?.email || '',
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });

      // Create default expense categories
      const defaultCategories = [
        { name: 'Combustível', user_id: userId },
        { name: 'Manutenção', user_id: userId },
        { name: 'Seguro', user_id: userId },
        { name: 'Impostos', user_id: userId },
        { name: 'Limpeza', user_id: userId },
        { name: 'Outros', user_id: userId }
      ];
      
      await supabase.from('expense_categories').insert(defaultCategories);
      
      console.log('Default data setup completed for new user');
    } catch (error) {
      console.error('Error setting up default data:', error);
    }
  };

  // Check subscription status
  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return;
      }
      
      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao verificar status da assinatura: ' + error.message,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Subscription check result:', data);
      
      if (data) {
        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            isSubscribed: data.subscribed || false,
            subscriptionTier: data.subscription_tier,
            subscriptionEnd: data.subscription_end,
            subscriptionEndDate: data.subscription_end, // For backward compatibility
          };
        });
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao verificar status da assinatura',
        variant: 'destructive',
      });
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!',
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Falha ao realizar login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name || email,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Bem-vindo ao MotoControle!',
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Falha ao criar conta',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: 'Logout realizado',
      description: 'Você saiu da sua conta',
    });
  };

  // Context value
  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    checkSubscription,
    logout,
    login,
    register
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
