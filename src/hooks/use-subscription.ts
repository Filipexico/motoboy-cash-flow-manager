
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionStatus } from './use-subscription-status';
import { useSubscriptionManagement } from './use-subscription-management';

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  const { 
    isLoading: statusLoading, 
    subscription, 
    checkSubscriptionStatus 
  } = useSubscriptionStatus();
  
  const { 
    isLoading: managementLoading,
    handleSubscribe,
    openCustomerPortal
  } = useSubscriptionManagement(checkSubscriptionStatus);

  // Detect user changes to clear data
  useEffect(() => {
    if (user?.id !== lastUserId) {
      if (user?.id) {
        setLastUserId(user.id);
        checkSubscriptionStatus();
      }
    }
  }, [user?.id, lastUserId]);

  // Handle URL parameters after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const sessionId = params.get('session_id');
    const simulated = params.get('simulated');
    
    if (success === 'true') {
      toast({
        title: 'Assinatura ativada',
        description: simulated === 'true' 
          ? 'Assinatura simulada ativada com sucesso (ambiente de teste).' 
          : 'Sua assinatura foi ativada com sucesso!',
      });
      
      window.history.replaceState(null, '', '/subscription');
      if (user) checkSubscriptionStatus();
    } else if (canceled === 'true') {
      toast({
        title: 'Assinatura cancelada',
        description: 'O processo de assinatura foi cancelado.',
        variant: 'destructive',
      });
      
      window.history.replaceState(null, '', '/subscription');
    }
  }, [user]);

  const isSubscribed = subscription?.subscribed || user?.isSubscribed || false;
  const subscriptionTier = subscription?.subscription_tier || user?.subscriptionTier || null;
  const subscriptionEnd = subscription?.subscription_end || user?.subscriptionEnd || null;

  return {
    isLoading: statusLoading || managementLoading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    checkSubscriptionStatus,
    handleSubscribe,
    openCustomerPortal
  };
};
