
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase, logAuthState } from '@/lib/supabase';
import { checkSubscription } from '@/services/subscriptionService';
import { useAuthState } from '@/hooks/useAuthState';
import { RegisterFormValues } from '@/types/userProfile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setIsLoading, updateUserData } = useAuthState();
  const { toast } = useToast();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

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
                // Fetch user profile
                const { data: userProfile, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (profileError) {
                  console.error("Error fetching user profile:", profileError);
                }

                // Update user data
                await updateUserData(session.user, userProfile);
                setIsLoading(false);
              } catch (error) {
                console.error("Error processing user data:", error);
                if (isMounted) {
                  await updateUserData(session.user);
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

        // Then check for existing session
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
            // Fetch user profile
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching user profile:", profileError);
            }

            // Update user data in state
            await updateUserData(session.user, userProfile);
            
            // Check subscription status - but don't wait for it to complete to show the UI
            if (isMounted && user) {
              checkSubscription(user, setUser).catch(error => {
                console.error("Error checking subscription, continuing...", error);
              });
            }
          } catch (profileError) {
            console.error("Error processing user data:", profileError);
            if (isMounted) {
              await updateUserData(session.user);
            }
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
  }, []);

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
      
      await logAuthState();
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
          },
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User created, setting up profile:", data.user.id);
        
        // 2. Create the user profile with additional information
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: formValues.fullName,
            phone_number: formValues.phoneNumber,
            address: formValues.address,
          });
        
        if (profileError) {
          console.error("Error creating user profile:", profileError);
          toast({
            title: 'Erro ao criar perfil',
            description: 'Sua conta foi criada, mas houve um erro ao salvar informações adicionais.',
            variant: 'destructive',
          });
        }
        
        // 3. Set up initial user data (expense categories, etc.)
        try {
          const { error: setupError } = await supabase.rpc('setup_new_user_data', {
            user_id_param: data.user.id,
            email_param: formValues.email
          });
          
          if (setupError) {
            console.error("Error setting up initial data:", setupError);
          } else {
            console.log("Initial user data set up successfully");
          }
        } catch (setupError) {
          console.error("Error calling setup function:", setupError);
        }
      }
      
      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Bem-vindo ao MotoControle!',
      });
      
      await logAuthState();
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

  // Context value
  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    initialCheckDone,
    checkSubscription: () => checkSubscription(user, setUser),
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
