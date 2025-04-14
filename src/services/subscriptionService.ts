
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const checkSubscription = async (user: User | null, setUser: (user: User) => void) => {
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
      
      if (data && user) {
        const updatedUser: User = {
          ...user,
          isSubscribed: data.subscribed || false,
          subscriptionTier: data.subscription_tier,
          subscriptionEnd: data.subscription_end,
          subscriptionEndDate: data.subscription_end,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro na função checkSubscription:', error);
    }
  } catch (error) {
    console.error('Erro em checkSubscription:', error);
  }
};
