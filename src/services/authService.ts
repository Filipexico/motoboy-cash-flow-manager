
import { supabase } from '@/lib/supabase';
import { setupNewUserData } from './userService';

export const loginUser = async (email: string, password: string) => {
  console.log(`Tentativa de login: ${email}`);
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
};

export const registerUser = async (email: string, password: string, name?: string) => {
  console.log(`Tentativa de registro: ${email}`);
  
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

  if (data.user) {
    await setupNewUserData(data.user.id, data.user.email || '');
  }

  console.log('Registro bem-sucedido:', data.user?.email);
  return data;
};

export const logoutUser = async () => {
  console.log('Realizando logout');
  await supabase.auth.signOut();
};
