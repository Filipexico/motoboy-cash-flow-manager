
import { supabase } from '@/integrations/supabase/client';

// Re-export a instância do Supabase do arquivo integrations/supabase/client
// para garantir que usamos a mesma instância em todo o aplicativo
export { supabase };

// Função para verificar o status da sessão
export const getSessionStatus = async () => {
  try {
    console.log('Verificando status da sessão...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      throw error;
    }
    console.log('Status da sessão:', data.session ? 'Ativa' : 'Sem sessão ativa');
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Erro em getSessionStatus:', error);
    return { session: null, error };
  }
};

// Função de debug para verificar o estado de autenticação
export const logAuthState = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Estado atual de autenticação:', session ? 'Autenticado' : 'Não autenticado');
    if (session) {
      console.log('ID do usuário:', session.user.id);
      console.log('Email do usuário:', session.user.email);
    }
    return session;
  } catch (error) {
    console.error('Erro ao verificar estado de autenticação:', error);
    return null;
  }
};
