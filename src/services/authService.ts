
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
    // Sempre garantir que o endereço seja um objeto JavaScript válido
    let addressObject = {};
    
    if (typeof formValues.address === 'string') {
      try {
        addressObject = JSON.parse(formValues.address);
      } catch (e) {
        console.error('Endereço não é um JSON válido, usando objeto vazio', e);
      }
    } else if (typeof formValues.address === 'object' && formValues.address !== null) {
      addressObject = formValues.address;
    }
    
    // Garantir que o objeto tenha todos os campos necessários
    const formattedAddress = {
      street: addressObject.street || '',
      city: addressObject.city || '',
      state: addressObject.state || '',
      zipcode: addressObject.zipcode || '',
      country: addressObject.country || 'Brasil'
    };
    
    console.log('Dados de registro processados:', {
      email: formValues.email,
      fullName: formValues.fullName,
      phoneNumber: formValues.phoneNumber,
      address: formattedAddress
    });
    
    // Registrar o usuário com metadados formatados corretamente
    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          full_name: formValues.fullName,
          phone_number: formValues.phoneNumber,
          address: formattedAddress
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
