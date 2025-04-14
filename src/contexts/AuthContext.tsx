
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { loginUser, registerUser, logoutUser } from '@/services/authService';
import { checkSubscription } from '@/services/subscriptionService';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      try {
        console.log("Verificando sessão do usuário...");
        if (isMounted) setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        console.log("Sessão:", session ? "Encontrada" : "Não encontrada");
        
        if (session?.user && isMounted) {
          console.log("Usuário autenticado:", session.user.email);
          
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('subscribers')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("Erro ao buscar perfil do usuário:", profileError);
            }

            if (isMounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                isAdmin: session.user.app_metadata?.role === 'admin',
                isSubscribed: userProfile?.subscribed || false,
                subscriptionTier: userProfile?.subscription_tier || null,
                subscriptionEnd: userProfile?.subscription_end || null,
                subscriptionEndDate: userProfile?.subscription_end || null,
                displayName: session.user.user_metadata?.display_name || session.user.email,
                name: session.user.user_metadata?.display_name || session.user.email,
              });
            }
            
            try {
              if (isMounted) await checkSubscription(user, setUser);
            } catch (subError) {
              console.error("Erro ao verificar assinatura, continuando...", subError);
            }
          } catch (profileError) {
            console.error("Erro ao processar dados do usuário:", profileError);
            if (isMounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                isAdmin: session.user.app_metadata?.role === 'admin',
                isSubscribed: false,
                subscriptionTier: null,
                subscriptionEnd: null,
                subscriptionEndDate: null,
                displayName: session.user.user_metadata?.display_name || session.user.email,
                name: session.user.user_metadata?.display_name || session.user.email,
              });
            }
          }
        } else if (isMounted) {
          console.log("Nenhum usuário autenticado");
          setUser(null);
        }
      } catch (error) {
        console.error('Auth effect error:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (isLoading && isMounted) {
        console.log("Timeout de segurança acionado no AuthContext");
        setIsLoading(false);
      }
    }, 5000);

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("Usuário desconectado");
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' && session) {
        console.log("Usuário conectado:", session.user.email);
        try {
          // Check user profile
          const { data: userProfile, error: profileError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Erro ao buscar perfil após login:", profileError);
          }

          if (isMounted) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              isAdmin: session.user.app_metadata?.role === 'admin',
              isSubscribed: userProfile?.subscribed || false,
              subscriptionTier: userProfile?.subscription_tier || null,
              subscriptionEnd: userProfile?.subscription_end || null,
              subscriptionEndDate: userProfile?.subscription_end || null,
              displayName: session.user.user_metadata?.display_name || session.user.email,
              name: session.user.user_metadata?.display_name || session.user.email,
            });
          }

          try {
            if (isMounted) await checkSubscription(user, setUser);
          } catch (error) {
            console.error("Erro ao verificar assinatura após login:", error);
          }
        } catch (error) {
          console.error('Error setting up user data:', error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await loginUser(email, password);
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!',
      });
    } catch (error) {
      console.error('Erro no login:', error);
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
      await registerUser(email, password, name);
      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Bem-vindo ao MotoControle!',
      });
    } catch (error) {
      console.error('Erro no registro:', error);
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
    await logoutUser();
    setUser(null);
    toast({
      title: 'Logout realizado',
      description: 'Você saiu da sua conta',
    });
  };

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    checkSubscription: () => checkSubscription(user, setUser),
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
