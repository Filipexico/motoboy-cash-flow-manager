import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase configuration
const SUPABASE_URL = 'https://qewlxnjqojxprkodfdqf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2x4bmpxb2p4cHJrb2RmZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjE0MTIsImV4cCI6MjA2MDE5NzQxMn0.lADhLBSYqfMPejc840DUUI-ylpihgiuHvHYYiHYnkKQ';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Verificando sessão do usuário...");
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          setIsLoading(false);
          return;
        }

        console.log("Sessão:", session ? "Encontrada" : "Não encontrada");
        
        if (session?.user) {
          console.log("Usuário autenticado:", session.user.email);
          
          try {
            // Verificar se o usuário existe na tabela subscribers - com tratamento de erro melhorado
            const { data: userProfile, error: profileError } = await supabase
              .from('subscribers')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("Erro ao buscar perfil do usuário:", profileError);
              // Continua mesmo com erro - não bloqueia o fluxo
            }

            // Define o usuário mesmo sem dados de perfil completos
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
            
            // Check subscription status - com tratamento de erro para não bloquear
            console.log("Verificando status da assinatura...");
            try {
              await checkSubscription();
            } catch (subError) {
              console.error("Erro ao verificar assinatura, continuando...", subError);
              // Não bloqueia o fluxo
            }
          } catch (profileError) {
            console.error("Erro ao processar dados do usuário:", profileError);
            // Ainda define o usuário com dados básicos se houver erro ao buscar perfil
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
        } else {
          console.log("Nenhum usuário autenticado");
          setUser(null);
        }
      } catch (error) {
        console.error('Auth effect error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Adicionando um timeout para garantir que isLoading será definido como false
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Timeout de segurança acionado no AuthContext");
        setIsLoading(false);
      }
    }, 8000);

    checkUser();

    // Subscribe to auth changes
    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_OUT') {
          console.log("Usuário desconectado");
          setUser(null);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && session) {
          console.log("Usuário conectado:", session.user.email);
          try {
            // Check if user exists in subscribers table - com tratamento de erro melhorado
            let userProfile;
            try {
              const { data, error: profileError } = await supabase
                .from('subscribers')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
              if (profileError) {
                console.error("Erro ao buscar perfil após login:", profileError);
                // Continua mesmo com erro
              }
              userProfile = data;
            } catch (error) {
              console.error("Erro ao buscar perfil:", error);
            }
              
            // If this is a new user (no subscriber record), attempt to create default data
            if (!userProfile) {
              console.log('Novo usuário detectado - configurando dados padrão');
              try {
                await setupNewUserData(session.user.id, session.user.email || '');
              } catch (setupError) {
                console.error("Erro ao configurar dados do usuário:", setupError);
                // Continua mesmo com erro
              }
            }

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
            
            // Check subscription status - com tratamento para não bloquear
            try {
              await checkSubscription();
            } catch (error) {
              console.error("Erro ao verificar assinatura após login:", error);
              // Não bloqueia o fluxo
            }
          } catch (error) {
            console.error('Error setting up user data:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Function to set up default data for new users
  const setupNewUserData = async (userId: string, email: string) => {
    try {
      console.log(`Configurando dados padrão para o usuário: ${email} (${userId})`);
      
      // Create a subscriber record
      const { error: subscriberError } = await supabase.from('subscribers').insert({
        user_id: userId,
        email: email,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });

      if (subscriberError) {
        console.error('Erro ao criar registro de assinante:', subscriberError);
        return;
      }

      // Create default expense categories
      const defaultCategories = [
        { name: 'Combustível', user_id: userId },
        { name: 'Manutenção', user_id: userId },
        { name: 'Seguro', user_id: userId },
        { name: 'Impostos', user_id: userId },
        { name: 'Limpeza', user_id: userId },
        { name: 'Outros', user_id: userId }
      ];
      
      const { error: categoriesError } = await supabase.from('expense_categories').insert(defaultCategories);
      
      if (categoriesError) {
        console.error('Erro ao criar categorias padrão:', categoriesError);
        return;
      }
      
      console.log('Configuração de dados padrão concluída para novo usuário');
    } catch (error) {
      console.error('Error setting up default data:', error);
    }
  };

  // Check subscription status - melhorado para não bloquear
  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("Sem sessão ativa para verificar assinatura");
        return;
      }
      
      console.log('Verificando status da assinatura...');
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Erro ao verificar assinatura:', error);
          // Não mostra toast para evitar incomodar o usuário
          return;
        }
        
        console.log('Resultado da verificação de assinatura:', data);
        
        if (data) {
          setUser(prevUser => {
            if (!prevUser) return null;
            
            return {
              ...prevUser,
              isSubscribed: data.subscribed || false,
              subscriptionTier: data.subscription_tier,
              subscriptionEnd: data.subscription_end,
              subscriptionEndDate: data.subscription_end,
            };
          });
        }
      } catch (error) {
        console.error('Erro na função checkSubscription:', error);
        // Não mostra toast para evitar incomodar o usuário
      }
    } catch (error) {
      console.error('Erro em checkSubscription:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log(`Tentativa de login: ${email}`);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      console.log('Login bem-sucedido:', data.user?.email);
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
  const register = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      console.log(`Tentativa de registro: ${email}`);
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
        console.error('Erro no registro:', error);
        throw error;
      }

      console.log('Registro bem-sucedido:', data.user?.email);
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
    console.log('Realizando logout');
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
