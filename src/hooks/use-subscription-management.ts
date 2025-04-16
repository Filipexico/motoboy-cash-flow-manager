
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { simulateTestSubscription } from '@/lib/subscription/utils';

export const useSubscriptionManagement = (checkSubscription: () => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: 'premium' | 'enterprise') => {
    setIsLoading(true);
    
    try {
      console.log(`Creating checkout session for plan: ${plan}`);
      
      try {
        const { data, error } = await supabase.functions.invoke<{ url: string }>('create-checkout', {
          body: { planType: plan }
        });
        
        if (error) {
          console.error('Error creating checkout session:', error);
          toast({
            title: 'Erro na assinatura',
            description: 'Ocorreu um erro ao processar sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          return;
        }
        
        console.log('Checkout session created:', data);
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        
        toast({
          title: 'Ambiente de teste',
          description: 'As Edge Functions do Stripe ainda não foram implantadas. Em produção, você seria redirecionado para a página de pagamento do Stripe.',
        });
        
        await simulateTestSubscription(user?.id || '', plan);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Erro na assinatura',
        description: 'Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    
    try {
      console.log('Opening customer portal...');
      
      try {
        const { data, error } = await supabase.functions.invoke<{ url: string }>('customer-portal');
        
        if (error) {
          console.error('Error opening customer portal:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível abrir o portal de gerenciamento da assinatura: ' + error.message,
            variant: 'destructive',
          });
          return;
        }
        
        console.log('Customer portal session created:', data);
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No portal URL returned');
        }
      } catch (error: any) {
        console.error('Error opening customer portal:', error);
        
        toast({
          title: 'Ambiente de teste',
          description: 'As Edge Functions do Stripe ainda não foram implantadas. Em produção, você seria redirecionado para o portal de gerenciamento de assinatura do Stripe.',
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal de gerenciamento da assinatura.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubscribe,
    openCustomerPortal,
  };
};
