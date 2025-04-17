
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

  // Detectar mudanças no usuário para limpar dados
  useEffect(() => {
    if (user?.id !== lastUserId) {
      if (user?.id) {
        console.log('ID do usuário mudou, verificando assinatura para:', user.id);
        setLastUserId(user.id);
        checkSubscriptionStatus();
      } else {
        console.log('Usuário não está mais autenticado, limpando dados de assinatura');
        setLastUserId(null);
      }
    }
  }, [user?.id, lastUserId, checkSubscriptionStatus]);

  // Lidar com parâmetros de URL após redirecionamento do Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const sessionId = params.get('session_id');
    const simulated = params.get('simulated');
    
    console.log('Parâmetros de URL detectados:', { success, canceled, sessionId, simulated });
    
    if (success === 'true') {
      toast({
        title: 'Assinatura ativada',
        description: simulated === 'true' 
          ? 'Assinatura simulada ativada com sucesso (ambiente de teste).' 
          : 'Sua assinatura foi ativada com sucesso!',
      });
      
      // Limpar os parâmetros da URL
      console.log('Limpando parâmetros da URL...');
      window.history.replaceState(null, '', '/subscription');
      
      // Verificar a assinatura apenas se o usuário estiver autenticado
      if (user) {
        console.log('Usuário autenticado, verificando assinatura após sucesso');
        // Pequeno atraso para garantir que o banco de dados foi atualizado
        setTimeout(() => {
          checkSubscriptionStatus();
        }, 1000);
      } else {
        console.log('Usuário não está autenticado, não é possível verificar assinatura');
      }
    } else if (canceled === 'true') {
      toast({
        title: 'Assinatura cancelada',
        description: 'O processo de assinatura foi cancelado.',
        variant: 'destructive',
      });
      
      // Limpar os parâmetros da URL
      console.log('Limpando parâmetros da URL após cancelamento...');
      window.history.replaceState(null, '', '/subscription');
    }
  }, [user, toast, checkSubscriptionStatus]);

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
