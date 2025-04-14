
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check for environment variables and provide fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log for debugging
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key length:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0);

// Supabase client - only create if URL is available
const supabase = SUPABASE_URL 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if Supabase client was created successfully
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized. Missing environment variables.');
      toast({
        title: 'Error de configuração',
        description: 'Falha ao conectar com o Supabase. Verifique as variáveis de ambiente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [toast]);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
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
    const authListener = supabase ? supabase.auth.onAuthStateChange(
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
    ) : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Function to set up default data for new users
  const setupNewUserData = async (userId: string) => {
    if (!supabase) return;
    
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
    if (!supabase) return;
    
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
    if (!supabase) {
      toast({
        title: 'Erro de configuração',
        description: 'Sistema de autenticação não disponível',
        variant: 'destructive',
      });
      throw new Error('Authentication system unavailable');
    }
    
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
  const register = async (email: string, password: string, name?: string): Promise<void> => {
    if (!supabase) {
      toast({
        title: 'Erro de configuração',
        description: 'Sistema de cadastro não disponível',
        variant: 'destructive',
      });
      throw new Error('Registration system unavailable');
    }
    
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
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Falha ao criar conta',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (!supabase) return;
    
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
