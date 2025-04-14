
import { supabase } from '@/lib/supabase';
import { setupNewUserData } from './userService';

export const loginUser = async (email: string, password: string) => {
  console.log(`Tentativa de login: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro no login:', error);
      throw error;
    }

    console.log('Login bem-sucedido:', data.user?.email);
    return data;
  } catch (error) {
    console.error('Erro ao tentar login:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name?: string) => {
  console.log(`Tentativa de registro: ${email}`);
  
  try {
    // First check if user already exists to avoid duplicate errors
    const { data: existingUsers } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUsers) {
      console.error('Email já está em uso');
      throw new Error('Email already taken');
    }
    
    // Proceed with registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name || email,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Erro no registro:', error);
      throw error;
    }

    if (data.user) {
      console.log('Usuário criado, configurando dados iniciais:', data.user.id);
      
      // Set up user data in database with retry mechanism
      try {
        await setupNewUserData(data.user.id, data.user.email || '');
        console.log('Dados iniciais configurados com sucesso');
      } catch (setupError) {
        console.error('Erro ao configurar dados iniciais:', setupError);
        // Continue with registration even if setup fails
        // We don't want to block the user from registering
      }
    } else {
      console.warn('Registro criado, mas sem usuário retornado:', data);
    }

    console.log('Registro bem-sucedido:', data.user?.email);
    return data;
  } catch (error) {
    console.error('Erro no processo de registro:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  console.log('Realizando logout');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
  console.log('Logout realizado com sucesso');
};
