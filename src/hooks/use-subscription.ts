
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useSubscription = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<null | {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>(null);
  
  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('Manually checking subscription status...');
      
      try {
        // Verifica se a função check-subscription existe
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        console.log('Subscription check result:', data);
        setSubscription(data);
        
        // Also update the global auth context
        await checkSubscription();
      } catch (error: any) {
        console.error('Error checking subscription:', error);
        // Se a função não existe, estamos em ambiente de desenvolvimento/teste
        // Simular um resultado de assinatura inativa para continuar funcionando
        setSubscription({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        
        toast({
          title: 'Aviso',
          description: 'Sistema em modo de teste. Funções de assinatura estão desativadas.',
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
  
  // Handle creating a checkout session
  const handleSubscribe = async (plan: 'premium' | 'enterprise') => {
    setIsLoading(true);
    
    try {
      console.log(`Creating checkout session for plan: ${plan}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { planType: plan }
        });
        
        if (error) {
          console.error('Error creating checkout session:', error);
          toast({
            title: 'Erro na assinatura',
            description: 'Ocorreu um erro ao processar sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        console.log('Checkout session created:', data);
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        
        // Se a função não existe, estamos em ambiente de desenvolvimento/teste
        toast({
          title: 'Modo de teste',
          description: 'Funções Stripe não estão configuradas neste ambiente. Em produção, você seria redirecionado para a página de pagamento.',
        });
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
  
  // Handle opening the customer portal
  const openCustomerPortal = async () => {
    setIsLoading(true);
    
    try {
      console.log('Opening customer portal...');
      
      try {
        const { data, error } = await supabase.functions.invoke('customer-portal');
        
        if (error) {
          console.error('Error opening customer portal:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível abrir o portal de gerenciamento da assinatura: ' + error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        console.log('Customer portal session created:', data);
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No portal URL returned');
        }
      } catch (error: any) {
        console.error('Error opening customer portal:', error);
        
        // Se a função não existe, estamos em ambiente de desenvolvimento/teste
        toast({
          title: 'Modo de teste',
          description: 'Portal do cliente Stripe não está configurado neste ambiente.',
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

  // Check for URL parameters after returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    
    if (success === 'true') {
      toast({
        title: 'Assinatura ativada',
        description: 'Sua assinatura foi ativada com sucesso!',
      });
      
      // Remove query parameters from URL
      window.history.replaceState(null, '', '/subscription');
      
      // Check subscription status after successful payment
      checkSubscriptionStatus();
    } else if (canceled === 'true') {
      toast({
        title: 'Assinatura cancelada',
        description: 'O processo de assinatura foi cancelado.',
        variant: 'destructive',
      });
      
      // Remove query parameters from URL
      window.history.replaceState(null, '', '/subscription');
    }
  }, []);
  
  // Check subscription status on component mount
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const isSubscribed = subscription?.subscribed || user?.isSubscribed || false;
  const subscriptionTier = subscription?.subscription_tier || user?.subscriptionTier || null;
  const subscriptionEnd = subscription?.subscription_end || user?.subscriptionEnd || null;

  return {
    isLoading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    checkSubscriptionStatus,
    handleSubscribe,
    openCustomerPortal
  };
};
