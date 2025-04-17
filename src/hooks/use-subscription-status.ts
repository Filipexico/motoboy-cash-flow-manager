
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
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Manually checking subscription status...');
      
      try {
        // Use the Edge Function to check subscription status
        const { data, error } = await supabase.functions.invoke<StripeResponse>('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          
          // Fallback to database check if Edge Function fails
          await checkSubscriptionDatabase(user.id, setSubscription);
          return;
        }
        
        console.log('Subscription check result:', data);
        
        if (data) {
          const subscriptionData: SubscriptionData = {
            subscribed: data.subscribed ?? false,
            subscription_tier: data.subscription_tier ?? null,
            subscription_end: data.subscription_end ?? null
          };
          
          setSubscription(subscriptionData);
          await authCheckSubscription();
        }
      } catch (error: any) {
        console.error('Error checking subscription:', error);
        await checkSubscriptionDatabase(user.id, setSubscription);
        
        toast({
          title: 'Aviso',
          description: 'Verificação de assinatura alternativa realizada devido a uma limitação técnica.',
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
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
