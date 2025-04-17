
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SubscriptionData, StripeResponse } from '@/lib/subscription/types';
import { checkSubscriptionDatabase } from '@/lib/subscription/utils';

export const useSubscriptionStatus = () => {
  const { user, checkSubscription: authCheckSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<null | SubscriptionData>(null);
  
  const checkSubscriptionStatus = async () => {
    if (!user) {
      console.log('Usuário não autenticado, não é possível verificar assinatura');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Verificando status da assinatura para o usuário:', user.id);
      
      try {
        // Usar a Edge Function para verificar o status da assinatura
        console.log('Chamando função edge check-subscription...');
        const { data, error } = await supabase.functions.invoke<StripeResponse>('check-subscription');
        
        if (error) {
          console.error('Erro ao verificar assinatura via Edge Function:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          
          // Fallback para verificação no banco de dados
          console.log('Usando fallback para verificação no banco de dados...');
          await checkSubscriptionDatabase(user.id, setSubscription);
          return;
        }
        
        console.log('Resultado da verificação da assinatura:', data);
        
        if (data) {
          const subscriptionData: SubscriptionData = {
            subscribed: data.subscribed ?? false,
            subscription_tier: data.subscription_tier ?? null,
            subscription_end: data.subscription_end ?? null
          };
          
          console.log('Atualizando estado local da assinatura:', subscriptionData);
          setSubscription(subscriptionData);
          
          // Atualizar o estado global da assinatura
          console.log('Atualizando estado global da assinatura...');
          await authCheckSubscription();
        }
      } catch (error: any) {
        console.error('Erro ao verificar assinatura:', error);
        
        // Fallback para verificação no banco de dados
        console.log('Usando fallback para verificação no banco de dados após exceção...');
        await checkSubscriptionDatabase(user.id, setSubscription);
        
        toast({
          title: 'Aviso',
          description: 'Verificação de assinatura alternativa realizada devido a uma limitação técnica.',
        });
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o status da sua assinatura.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscription,
    checkSubscriptionStatus,
  };
};
