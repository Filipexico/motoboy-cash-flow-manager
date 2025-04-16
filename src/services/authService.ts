
import { supabase } from '@/lib/supabase';
import { RegisterFormValues } from '@/types/userProfile';
import { formatAddressToJSON } from '@/lib/utils';

export const loginUser = async (email: string, password: string) => {
  console.log(`Tentativa de login: ${email}`);
  try {
    // Para facilitar o debug, vamos verificar se é o admin
    if (email === 'admin@motocontrole.com') {
      console.log('Tentativa de login de administrador');
    }
    
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
    // Garantir que o endereço seja um objeto adequado para JSONB
    const addressObject = formatAddressToJSON(formValues.address);
    
    console.log('Formatted address for registration:', addressObject);
    
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

export const loginAdmin = async () => {
  console.log('Realizando login de administrador direto');
  try {
    // Tentar fazer login com credenciais de administrador fixas
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@motocontrole.com',
      password: 'Admin@123',
    });

    if (error) {
      console.error('Erro no login de administrador:', error);
      throw error;
    }

    console.log('Login de administrador bem-sucedido:', data.user?.email);
    return data;
  } catch (error) {
    console.error('Erro ao tentar login de administrador:', error);
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

// Função para verificar o status do administrador
export const checkAdminStatus = async () => {
  try {
    console.log('Verificando status do administrador');
    // Como não podemos usar getUserByEmail, vamos usar uma consulta para obter o administrador
    const { data, error } = await supabase
      .from('subscribers')
      .select('user_id, email, role')
      .eq('email', 'admin@motocontrole.com')
      .eq('role', 'admin')
      .single();
    
    if (error) {
      console.error('Erro ao verificar administrador:', error);
      return { exists: false, error };
    }
    
    // Se encontrou o administrador, buscamos os detalhes do usuário
    if (data && data.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user_id);
      
      if (userError) {
        console.error('Erro ao obter detalhes do administrador:', userError);
        return { exists: false, error: userError };
      }
      
      return { exists: !!userData?.user, userData: userData?.user };
    }
    
    return { exists: false, error: null };
  } catch (error) {
    console.error('Erro ao verificar status do administrador:', error);
    return { exists: false, error };
  }
};
