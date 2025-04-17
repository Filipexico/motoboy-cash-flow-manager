
import { createClient } from '@supabase/supabase-js';

// Importe o cliente diretamente do arquivo de integração
// Isso garante que só teremos uma instância do GoTrueClient em toda aplicação
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Re-exportar a instância única do cliente Supabase
export const supabase = supabaseClient;

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

// Função para debug do estado de autenticação
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
