
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
    
    // Verificar se é administrador e atualizar metadata se necessário
    if (email === 'admin@motocontrole.com') {
      // Verificar se o usuário tem o papel de admin nos metadados
      if (!data.user?.app_metadata?.role || data.user?.app_metadata?.role !== 'admin') {
        console.log('Atualizando papel de administrador para o usuário');
        try {
          // Atualizar o papel do usuário para admin
          const { error: updateError } = await supabase.rpc('set_user_admin_status', {
            user_id_param: data.user?.id,
            is_admin_param: true
          });
          
          if (updateError) {
            console.error('Erro ao atualizar papel de admin:', updateError);
          } else {
            console.log('Papel de admin atualizado com sucesso');
          }
        } catch (updateError) {
          console.error('Erro ao tentar atualizar papel de admin:', updateError);
        }
      }
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
    
    // Garantir que o usuário tenha o papel de administrador
    if (!data.user?.app_metadata?.role || data.user?.app_metadata?.role !== 'admin') {
      console.log('Atualizando papel de administrador');
      try {
        // Atualizar o papel do usuário para admin
        const { error: updateError } = await supabase.rpc('set_user_admin_status', {
          user_id_param: data.user?.id,
          is_admin_param: true
        });
        
        if (updateError) {
          console.error('Erro ao atualizar papel de admin:', updateError);
        } else {
          console.log('Papel de admin atualizado com sucesso');
        }
      } catch (updateError) {
        console.error('Erro ao tentar atualizar papel de admin:', updateError);
      }
    }
    
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
    // Verificar se existe um usuário administrador na autenticação
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      console.log('Sessão ativa encontrada:', sessionData.session.user.email);
      
      // Verificar se o usuário atual é o administrador
      if (sessionData.session.user.email === 'admin@motocontrole.com') {
        console.log('Usuário atual é o administrador');
        return { 
          exists: true, 
          isCurrentUser: true,
          userData: sessionData.session.user 
        };
      }
    }
    
    // Verificar na tabela de subscribers
    const { data: adminSubscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('user_id, email, role')
      .eq('email', 'admin@motocontrole.com')
      .eq('role', 'admin')
      .single();
    
    if (subscriberError) {
      if (!subscriberError.message.includes('No rows found')) {
        console.error('Erro ao verificar administrador em subscribers:', subscriberError);
      }
      console.log('Nenhum administrador encontrado na tabela subscribers');
      return { exists: false, error: subscriberError };
    }
    
    console.log('Administrador encontrado em subscribers:', adminSubscriber);
    
    // Se encontrou o registro do admin, verificar detalhes do usuário
    if (adminSubscriber && adminSubscriber.user_id) {
      try {
        // Para evitar problema de permissão com getUserById, usamos getUser()
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Erro ao obter detalhes do usuário atual:', authError);
          return { 
            exists: true, 
            isCurrentUser: false,
            userData: null,
            subscriberData: adminSubscriber
          };
        }
        
        const isCurrentUser = authData.user?.id === adminSubscriber.user_id;
        
        return { 
          exists: true, 
          isCurrentUser,
          userData: isCurrentUser ? authData.user : null,
          subscriberData: adminSubscriber
        };
      } catch (authError) {
        console.error('Erro ao verificar detalhes do administrador:', authError);
        return { 
          exists: true, 
          isCurrentUser: false,
          userData: null,
          subscriberData: adminSubscriber
        };
      }
    }
    
    return { exists: false, error: null };
  } catch (error) {
    console.error('Erro ao verificar status do administrador:', error);
    return { exists: false, error };
  }
};

// Função para criar ou atualizar usuário administrador
export const createOrUpdateAdmin = async () => {
  try {
    console.log('Criando ou atualizando administrador');
    
    // Verificar se o admin já existe
    const { exists, userData } = await checkAdminStatus();
    
    if (exists && userData) {
      console.log('Administrador já existe, apenas atualizando perfil');
      
      // Garantir que tenha o papel correto
      const { error: updateError } = await supabase.rpc('set_user_admin_status', {
        user_id_param: userData.id,
        is_admin_param: true
      });
      
      if (updateError) {
        console.error('Erro ao atualizar papel de admin:', updateError);
        throw updateError;
      }
      
      return { success: true, message: 'Administrador atualizado com sucesso', user: userData };
    }
    
    // Se não existe, criar novo admin via RPC
    const { data, error } = await supabase.rpc('create_admin_user', {
      email: 'admin@motocontrole.com',
      password: 'Admin@123',
      full_name: 'Administrador do Sistema'
    });
    
    if (error) {
      console.error('Erro ao criar administrador:', error);
      throw error;
    }
    
    return { 
      success: true, 
      message: 'Administrador criado com sucesso',
      user_id: data
    };
  } catch (error) {
    console.error('Erro ao criar/atualizar administrador:', error);
    return { 
      success: false, 
      message: `Erro: ${error.message || 'Falha desconhecida'}`,
      error
    };
  }
};
