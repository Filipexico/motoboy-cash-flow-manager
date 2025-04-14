import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<null | {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>(null);
  
  // Check for environment variables
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Only create the client if URL is available
  let supabase = null;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }
  
  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user || !supabase) {
      if (!supabase) {
        toast({
          title: 'Configuração incompleta',
          description: 'As variáveis de ambiente do Supabase não estão configuradas corretamente.',
          variant: 'destructive',
        });
      }
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('Manually checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível verificar o status da sua assinatura: ' + error.message,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      console.log('Subscription check result:', data);
      setSubscription(data);
      
      // Also update the global auth context
      await checkSubscription();
      
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
    if (!supabase) {
      toast({
        title: 'Erro de configuração',
        description: 'Sistema de assinaturas não disponível. Verifique as variáveis de ambiente do Supabase.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Creating checkout session for plan: ${plan}`);
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
        throw new Error(error.message);
      }
      
      console.log('Checkout session created:', data);
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Erro na assinatura',
        description: 'Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle opening the customer portal
  const openCustomerPortal = async () => {
    if (!supabase) {
      toast({
        title: 'Erro de configuração',
        description: 'Sistema de gerenciamento de assinaturas não disponível. Verifique as variáveis de ambiente do Supabase.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível abrir o portal de gerenciamento da assinatura: ' + error.message,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      console.log('Customer portal session created:', data);
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
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
    openCustomerPortal: () => {
      if (!supabase) {
        toast({
          title: 'Erro de configuração',
          description: 'Sistema de gerenciamento de assinaturas não disponível. Verifique as variáveis de ambiente do Supabase.',
          variant: 'destructive',
        });
        return Promise.resolve();
      }
      
      setIsLoading(true);
      
      try {
        console.log('Opening customer portal...');
        const { data, error } = await supabase.functions.invoke('customer-portal');
        
        if (error) {
          console.error('Error opening customer portal:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível abrir o portal de gerenciamento da assinatura: ' + error.message,
            variant: 'destructive',
          });
          throw new Error(error.message);
        }
        
        console.log('Customer portal session created:', data);
        
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No portal URL returned');
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
    }
  };
};
