
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
    
    // Verificamos se o usuário tem papel de admin nos metadados
    const isAdmin = data.user?.app_metadata?.role === 'admin';
    if (isAdmin) {
      console.log('Usuário identificado como administrador');
    }
    
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

export const logoutUser = async () => {
  console.log('Realizando logout');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
    console.log('Logout realizado com sucesso');
    
    // Limpar dados da sessão ao fazer logout
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    
  } catch (error) {
    console.error('Erro ao tentar fazer logout:', error);
    throw error;
  }
};

// Função para verificar o status do administrador
export const checkAdminStatus = async (userId: string) => {
  try {
    console.log('Verificando status do administrador');
    
    // Verificar se o usuário está autenticado
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log('Nenhuma sessão ativa encontrada');
      return { isAdmin: false };
    }
    
    // Verificar se o usuário tem a role de admin nos metadados
    const isAdmin = sessionData.session.user.app_metadata?.role === 'admin';
    
    console.log('Status de administrador:', isAdmin ? 'É administrador' : 'Não é administrador');
    
    return { isAdmin };
  } catch (error) {
    console.error('Erro ao verificar status do administrador:', error);
    return { isAdmin: false, error };
  }
};

// Função para promover um usuário a administrador (deve ser chamada com muita cautela)
export const promoteUserToAdmin = async (userId: string) => {
  try {
    console.log('Promovendo usuário a administrador:', userId);
    
    // Verificar primeiro se o usuário atual é admin
    const { isAdmin } = await checkAdminStatus(userId);
    
    if (!isAdmin) {
      // Apenas administradores podem promover outros usuários
      throw new Error('Permissão negada: apenas administradores podem promover outros usuários');
    }
    
    // Promover o usuário através da função RPC
    const { error } = await supabase.rpc('set_user_admin_status', {
      user_id_param: userId,
      is_admin_param: true
    });
    
    if (error) {
      console.error('Erro ao promover usuário a administrador:', error);
      throw error;
    }
    
    console.log('Usuário promovido a administrador com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao promover usuário a administrador:', error);
    return { success: false, error };
  }
};
