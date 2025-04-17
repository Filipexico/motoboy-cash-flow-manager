
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
        const { data, error } = await supabase.functions.invoke<{ url: string; simulated?: boolean }>('create-checkout', {
          body: { planType: plan }
        });
        
        if (error) {
          console.error('Error creating checkout session:', error);
          
          // If Edge Function fails, try simulation mode
          console.log('Falling back to simulation mode...');
          if (user?.id) {
            const result = await simulateTestSubscription(user.id, plan);
            console.log('Simulated subscription result:', result);
            
            toast({
              title: 'Assinatura simulada',
              description: 'Modo de simulação ativado para testes de desenvolvimento.',
            });
            
            await checkSubscription();
            return;
          }
          
          toast({
            title: 'Erro na assinatura',
            description: 'Ocorreu um erro ao processar sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          return;
        }
        
        console.log('Checkout session created:', data);
        
        if (data?.simulated) {
          toast({
            title: 'Assinatura simulada',
            description: 'Modo de simulação ativado para testes de desenvolvimento.',
          });
          await checkSubscription();
          return;
        }
        
        if (data?.url) {
          console.log('Redirecionando para:', data.url);
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
        
        if (user?.id) {
          const result = await simulateTestSubscription(user.id, plan);
          console.log('Simulated subscription result:', result);
          await checkSubscription();
        }
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
        const { data, error } = await supabase.functions.invoke<{ url: string; simulated?: boolean }>('customer-portal');
        
        if (error) {
          console.error('Error opening customer portal:', error);
          
          // Show user-friendly message
          toast({
            title: 'Ambiente de teste',
            description: 'Portal do cliente simulado para ambiente de teste.',
          });
          return;
        }
        
        console.log('Customer portal session created:', data);
        
        if (data?.simulated) {
          toast({
            title: 'Ambiente de teste',
            description: 'Portal de gerenciamento simulado para ambiente de teste.',
          });
          return;
        }
        
        if (data?.url) {
          console.log('Redirecionando para portal do cliente:', data.url);
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
