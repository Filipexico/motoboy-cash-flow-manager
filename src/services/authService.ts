
import { supabase } from '@/lib/supabase';
import { RegisterFormValues } from '@/types/userProfile';

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

export const registerUser = async (formValues: RegisterFormValues) => {
  console.log(`Tentativa de registro: ${formValues.email}`);
  
  try {
    // Verificar se os dados estão sendo enviados corretamente
    console.log('Dados de registro:', {
      email: formValues.email,
      password: formValues.password,
      fullName: formValues.fullName,
      phoneNumber: formValues.phoneNumber,
      address: formValues.address
    });
    
    // Certifique-se de que o endereço é um objeto JSON válido
    const addressData = typeof formValues.address === 'string' 
      ? JSON.parse(formValues.address) 
      : formValues.address;
    
    // Create the new user with properly formatted metadata
    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          full_name: formValues.fullName,
          phone_number: formValues.phoneNumber,
          address: addressData
        },
      },
    });

    if (error) {
      console.error('Erro no registro:', error);
      throw error;
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
