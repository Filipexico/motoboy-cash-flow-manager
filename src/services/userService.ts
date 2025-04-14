
import { supabase } from '@/lib/supabase';

export const setupNewUserData = async (userId: string, email: string) => {
  try {
    console.log(`Configurando dados padrão para o usuário: ${email} (${userId})`);
    
    // Tentar criar a tabela subscribers se ela não existir
    try {
      await supabase.rpc('create_subscribers_if_not_exists');
      console.log('Verificação de tabela subscribers realizada');
    } catch (tableError) {
      console.error('Erro ao verificar tabela subscribers:', tableError);
      // Continua mesmo com erro para tentar as operações seguintes
    }
    
    // Check if subscriber record already exists to avoid duplicates
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erro ao verificar assinante existente:', checkError);
      // Se houve erro na verificação, podemos ter um problema de tabela não existente
      // Tentemos criar a tabela diretamente via SQL
      try {
        await supabase.rpc('create_subscribers_if_not_exists');
        console.log('Tentativa de criar tabela subscribers realizada');
      } catch (createError) {
        console.error('Erro ao criar tabela subscribers:', createError);
      }
    }
    
    if (!existingSubscriber) {
      // Create a subscriber record
      const { error: subscriberError } = await supabase.from('subscribers').insert({
        user_id: userId,
        email: email,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });

      if (subscriberError) {
        console.error('Erro ao criar registro de assinante:', subscriberError);
        throw subscriberError;
      }
      
      console.log('Registro de assinante criado com sucesso');
    } else {
      console.log('Registro de assinante já existe, pulando criação');
    }

    // Check if expense categories already exist for this user
    const { data: existingCategories, error: categoriesCheckError } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (categoriesCheckError) {
      console.error('Erro ao verificar categorias existentes:', categoriesCheckError);
      // Tentar criar a tabela de categorias se necessário
      try {
        await supabase.rpc('create_expense_categories_if_not_exists');
        console.log('Verificação de tabela expense_categories realizada');
      } catch (tableError) {
        console.error('Erro ao verificar tabela expense_categories:', tableError);
      }
    }
    
    if (!existingCategories || existingCategories.length === 0) {
      // Create default expense categories
      const defaultCategories = [
        { name: 'Combustível', user_id: userId },
        { name: 'Manutenção', user_id: userId },
        { name: 'Seguro', user_id: userId },
        { name: 'Impostos', user_id: userId },
        { name: 'Limpeza', user_id: userId },
        { name: 'Outros', user_id: userId }
      ];
      
      const { error: categoriesError } = await supabase.from('expense_categories').insert(defaultCategories);
      
      if (categoriesError) {
        console.error('Erro ao criar categorias padrão:', categoriesError);
        throw categoriesError;
      }
      
      console.log('Categorias padrão criadas com sucesso');
    } else {
      console.log('Categorias já existem, pulando criação');
    }
    
    console.log('Configuração de dados padrão concluída para novo usuário');
    return true;
  } catch (error) {
    console.error('Erro ao configurar dados padrão:', error);
    throw error;
  }
};
