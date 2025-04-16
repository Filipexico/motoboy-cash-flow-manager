
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { RegisterFormValues } from '@/types/userProfile';
import { useAuthState } from '@/hooks/useAuthState';
import { setupNewUserData } from '@/services/userService';
import { formatAddressToJSON } from '@/lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setIsLoading, updateUserData } = useAuthState();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        console.log("AuthProvider: Checking user session...");
        if (isMounted) setIsLoading(true);
        
        // Primeiro, verificar sessão inicial
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
            setInitialCheckDone(true);
          }
          return;
        }

        console.log("Initial session check:", session ? "Session found" : "No session");
        
        if (session?.user && isMounted) {
          console.log("User authenticated:", session.user.email);
          
          try {
            const updatedUser = await updateUserData(session.user);
            setUser(updatedUser);
          } catch (profileError) {
            console.error("Error processing user data:", profileError);
          } finally {
            if (isMounted) {
              setIsLoading(false);
              setInitialCheckDone(true);
            }
          }
        } else if (isMounted) {
          console.log("No authenticated user");
          setUser(null);
          setIsLoading(false);
          setInitialCheckDone(true);
        }
        
        // Configurar listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (session) {
            console.log("Session found in auth state change:", session.user.email);
            if (isMounted) {
              try {
                const updatedUser = await updateUserData(session.user);
                setUser(updatedUser);
                setIsLoading(false);
              } catch (error) {
                console.error("Error processing user data:", error);
                if (isMounted) {
                  setIsLoading(false);
                }
              }
            }
          } else {
            console.log("No session in auth state change");
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth effect error:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          setInitialCheckDone(true);
        }
      }
    };

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading && isMounted) {
        console.log("Safety timeout triggered in AuthContext");
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    }, 5000);

    checkUser();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [setIsLoading, setUser, updateUserData]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting login for: ${email}`);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login successful");
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!',
      });
      
      return data;
    } catch (error: any) {
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
  const register = async (formValues: RegisterFormValues) => {
    try {
      console.log(`Registering new user: ${formValues.email}`);
      setIsLoading(true);
      
      // Garantir que o endereço seja um objeto JSON válido
      const addressObject = formatAddressToJSON(formValues.address);
      console.log("Formatted address for registration:", addressObject);
      
      const { data, error } = await supabase.auth.signUp({
        email: formValues.email,
        password: formValues.password,
        options: {
          data: {
            full_name: formValues.fullName,
            phone_number: formValues.phoneNumber,
            address: addressObject
          },
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User created, setting up profile:", data.user.id);
        
        try {
          await setupNewUserData(data.user.id, formValues.email);
          
          // Importante: Atualizar manualmente o estado do usuário após registro bem-sucedido
          // para evitar problemas de redirecionamento
          const updatedUser = await updateUserData(data.user);
          setUser(updatedUser);
          setInitialCheckDone(true);
          
        } catch (profileError) {
          console.error("Error setting up user profile:", profileError);
          // Continue mesmo com erro no perfil
        }
      }
      
      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Bem-vindo ao MotoControle!',
      });
      
      return data;
    } catch (error: any) {
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

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out user");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta',
      });
      console.log("Logout successful");
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: error.message || 'Não foi possível sair da sua conta',
        variant: 'destructive',
      });
    }
  };

  // Check subscription
  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isSubscribed: data.subscribed || false,
            subscriptionTier: data.subscription_tier,
            subscriptionEnd: data.subscription_end,
            subscriptionEndDate: data.subscription_end,
          };
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Context value
  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    initialCheckDone,
    checkSubscription,
    logout,
    login,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
