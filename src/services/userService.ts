
import { supabase } from '@/lib/supabase';

export const setupNewUserData = async (userId: string, email: string) => {
  try {
    console.log(`Configurando dados padrão para o usuário: ${email} (${userId})`);
    
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
      return;
    }

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
      return;
    }
    
    console.log('Configuração de dados padrão concluída para novo usuário');
  } catch (error) {
    console.error('Error setting up default data:', error);
  }
};
