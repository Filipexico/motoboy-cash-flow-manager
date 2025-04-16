
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
    // Formatar o endereço adequadamente para o banco de dados
    let addressObject: Record<string, string> = {
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: 'Brasil'
    };
    
    if (typeof formValues.address === 'string') {
      try {
        const parsed = JSON.parse(formValues.address);
        if (parsed && typeof parsed === 'object') {
          addressObject = {
            street: parsed.street || '',
            city: parsed.city || '',
            state: parsed.state || '',
            zipcode: parsed.zipcode || '',
            country: parsed.country || 'Brasil'
          };
        }
      } catch (e) {
        console.error('Endereço não é um JSON válido:', e);
      }
    } else if (formValues.address && typeof formValues.address === 'object') {
      addressObject = {
        street: formValues.address.street || '',
        city: formValues.address.city || '',
        state: formValues.address.state || '',
        zipcode: formValues.address.zipcode || '',
        country: formValues.address.country || 'Brasil'
      };
    }
    
    console.log('Endereço formatado para registro:', addressObject);
    
    // Registrar o usuário com metadados formatados corretamente
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
