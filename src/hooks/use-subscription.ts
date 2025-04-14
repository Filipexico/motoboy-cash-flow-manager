import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { checkSubscription } from '@/services/subscriptionService';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<null | SubscriptionData>(null);
  
  const checkSubscriptionStatus = async () => {
    if (!user) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('Manually checking subscription status...');
      
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
            variant: 'destructive',
          });
          
          await fallbackSubscriptionCheck(user.id);
          return;
        }
        
        console.log('Subscription check result:', data);
        
        const subscriptionData: SubscriptionData = {
          subscribed: Boolean(data?.subscribed),
          subscription_tier: data?.subscription_tier as string | null,
          subscription_end: data?.subscription_end as string | null
        };
        
        setSubscription(subscriptionData);
        
        await checkSubscription();
      } catch (error: any) {
        console.error('Error checking subscription:', error);
        await fallbackSubscriptionCheck(user.id);
        
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
  
  const fallbackSubscriptionCheck = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Fallback subscription check error:', error);
        setSubscription({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }
      
      if (data) {
        setSubscription({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end
        });
      } else {
        setSubscription({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
      }
    } catch (error) {
      console.error('Fallback subscription check error:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }
  };
  
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
        
        await simulateTestSubscription(plan);
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
  
  const simulateTestSubscription = async (plan: 'premium' | 'enterprise') => {
    if (!user) return;
    
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Adiciona 1 mês
      
      const { error } = await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        subscribed: true,
        subscription_tier: plan,
        subscription_end: endDate.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error simulating subscription:', error);
        throw error;
      }
      
      setSubscription({
        subscribed: true,
        subscription_tier: plan,
        subscription_end: endDate.toISOString()
      });
      
      toast({
        title: 'Assinatura simulada',
        description: `Assinatura ${plan} simulada com sucesso para fins de teste.`,
      });
      
      await checkSubscription();
    } catch (error) {
      console.error('Error simulating subscription:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível simular a assinatura.',
        variant: 'destructive',
      });
    }
  };
  
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    
    if (success === 'true') {
      toast({
        title: 'Assinatura ativada',
        description: 'Sua assinatura foi ativada com sucesso!',
      });
      
      window.history.replaceState(null, '', '/subscription');
      
      checkSubscriptionStatus();
    } else if (canceled === 'true') {
      toast({
        title: 'Assinatura cancelada',
        description: 'O processo de assinatura foi cancelado.',
        variant: 'destructive',
      });
      
      window.history.replaceState(null, '', '/subscription');
    }
  }, []);
  
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
