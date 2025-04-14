
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const checkSubscription = async (user: User | null, setUser: (user: User | null) => void) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log("Sem sessão ativa para verificar assinatura");
      return;
    }
    
    console.log('Verificando status da assinatura...');
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return;
      }
      
      console.log('Resultado da verificação de assinatura:', data);
      
      if (data) {
        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            isSubscribed: data.subscribed || false,
            subscriptionTier: data.subscription_tier,
            subscriptionEnd: data.subscription_end,
            subscriptionEndDate: data.subscription_end,
          };
        });
      }
    } catch (error) {
      console.error('Erro na função checkSubscription:', error);
    }
  } catch (error) {
    console.error('Erro em checkSubscription:', error);
  }
};
