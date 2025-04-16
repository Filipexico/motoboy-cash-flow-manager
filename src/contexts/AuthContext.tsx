
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { RegisterFormValues } from '@/types/userProfile';
import { useAuthState } from '@/hooks/useAuthState';

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
        
        // Set up auth state change listener first
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (session) {
            console.log("Session found in auth state change:", session.user.email);
            if (isMounted) {
              try {
                // Update user state with session data
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

        // Check for existing session
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
            // Set user state with session data
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

    // Safety timeout to prevent indefinite loading state
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
      
      // 1. Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email: formValues.email,
        password: formValues.password,
        options: {
          data: {
            display_name: formValues.fullName,
            full_name: formValues.fullName,
            phone_number: formValues.phoneNumber,
            address: formValues.address
          },
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User created, setting up profile:", data.user.id);
        
        // 2. Create the user profile with additional information
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .insert({
            user_id: data.user.id,
            email: formValues.email,
            subscribed: false
          });
        
        if (subscriberError) {
          console.error("Error creating subscriber record:", subscriberError);
          toast({
            title: 'Erro ao criar registro',
            description: 'Sua conta foi criada, mas houve um erro ao salvar informações adicionais.',
            variant: 'destructive',
          });
        }
        
        // 3. Also try to create user profile with the full profile information
        try {
          // Check if the user_profiles table exists before attempting to insert
          const { error: tableCheckError } = await supabase
            .from('subscribers')
            .select('id')
            .limit(1);
            
          if (!tableCheckError) {
            // The table exists, attempt to add profile data
            await supabase.from('subscribers').update({
              role: 'user',
              phone_number: formValues.phoneNumber,
              // Use a jsonb column for address if it exists
              address_data: formValues.address
            }).eq('user_id', data.user.id);
          }
        } catch (profileError) {
          console.error("Error updating subscriber record with profile data:", profileError);
          // Continue with registration even if profile update fails
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

  // Function to check subscription status
  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .single();
      
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
