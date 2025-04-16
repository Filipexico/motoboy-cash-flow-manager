
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
        // Check if the edge function exists by making an OPTIONS request
        const testResponse = await fetch(`${supabase.functions.url}/check-subscription`, { 
          method: 'OPTIONS',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const edgeFunctionExists = testResponse.status !== 404;
        
        if (edgeFunctionExists) {
          console.log('Edge function exists, checking subscription via function...');
          const { data, error } = await supabase.functions.invoke<StripeResponse>('check-subscription');
          
          if (error) {
            console.error('Error checking subscription:', error);
            toast({
              title: 'Erro',
              description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
              variant: 'destructive',
            });
            
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
        } else {
          console.log('Edge function not found, falling back to database check...');
          await checkSubscriptionDatabase(user.id, setSubscription);
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
