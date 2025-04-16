
import { supabase } from '@/lib/supabase';
import { RegisterFormValues } from '@/types/userProfile';
import { formatAddressToJSON } from '@/lib/utils';

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
    // Primeiro, vamos garantir que o endereço seja um objeto JSON válido
    const addressObject = formatAddressToJSON(formValues.address);
    
    // Log detalhado dos dados processados
    console.log('Dados de registro processados:', {
      email: formValues.email,
      fullName: formValues.fullName,
      phoneNumber: formValues.phoneNumber,
      addressObject: JSON.stringify(addressObject)
    });
    
    // Registrar o usuário com os dados formatados corretamente
    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          full_name: formValues.fullName,
          phone_number: formValues.phoneNumber,
          address: addressObject
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
