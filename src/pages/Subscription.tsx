
import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import SubscriptionPlan from '@/components/subscription/SubscriptionPlan';
import SubscriptionDetails from '@/components/subscription/SubscriptionDetails';
import FAQSection from '@/components/subscription/FAQSection';
import { subscriptionPlans } from '@/data/subscription-plans';
import { useSubscription } from '@/hooks/use-subscription';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const {
    isLoading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    checkSubscriptionStatus,
    handleSubscribe,
    openCustomerPortal
  } = useSubscription();
  
  const { toast } = useToast();

  // Verificar e criar tabelas ao montar o componente
  useEffect(() => {
    const setupTablesIfNeeded = async () => {
      try {
        // Tentar criar as tabelas necessárias se elas não existirem
        await supabase.rpc('create_subscribers_if_not_exists');
        console.log('Verificação de tabela subscribers concluída');
      } catch (error) {
        console.error('Erro ao verificar tabela subscribers:', error);
        toast({
          title: 'Aviso do Sistema',
          description: 'Configuração inicial em andamento. Algumas funcionalidades podem estar limitadas.',
        });
      }
    };
    
    setupTablesIfNeeded();
  }, []);

  return (
    <div>
      <PageHeader
        title="Assinatura"
        description="Escolha o plano ideal para suas necessidades"
      >
        <Button 
          variant="outline" 
          onClick={checkSubscriptionStatus}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar assinatura
            </>
          )}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <SubscriptionPlan
            key={plan.id}
            title={plan.title}
            description={plan.description}
            price={plan.price}
            isCurrentPlan={(plan.id === 'free' && !isSubscribed) || 
                          (plan.id === 'premium' && subscriptionTier === 'premium') || 
                          (plan.id === 'enterprise' && subscriptionTier === 'enterprise')}
            isRecommended={plan.isRecommended}
            features={plan.features}
            onSubscribe={() => plan.id !== 'free' && handleSubscribe(plan.id as 'premium' | 'enterprise')}
            onManage={openCustomerPortal}
            isSubscribed={isSubscribed}
            isLoading={isLoading}
          />
        ))}
      </div>

      {isSubscribed && subscriptionTier && subscriptionEnd && (
        <SubscriptionDetails
          subscriptionTier={subscriptionTier}
          subscriptionEnd={subscriptionEnd}
          onManage={openCustomerPortal}
        />
      )}

      <FAQSection />
    </div>
  );
};

export default Subscription;
