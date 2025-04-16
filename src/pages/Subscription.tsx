
import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const [lastChecked, setLastChecked] = useState<string>('Never');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

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

  // Custom check subscription status with debug info
  const handleCheckSubscription = async () => {
    try {
      setLastChecked(new Date().toLocaleTimeString());
      
      // Get session info for debugging
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Call the actual subscription check
      await checkSubscriptionStatus();
      
      // Get debug info from edge function
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error) {
          setDebugInfo({
            subscriptionData: data,
            sessionInfo: {
              hasSession: !!sessionData?.session,
              userId: sessionData?.session?.user?.id,
              userEmail: sessionData?.session?.user?.email,
              tokenExpiry: sessionData?.session?.expires_at 
                ? new Date(sessionData.session.expires_at * 1000).toLocaleString() 
                : 'Unknown'
            },
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error getting debug info:', error);
        setDebugInfo({
          error: error.message || 'Unknown error getting debug info',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in handleCheckSubscription:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar a assinatura: ' + (error.message || 'Erro desconhecido'),
        variant: 'destructive',
      });
    }
  };

  // Verificar se as edge functions do Stripe estão implantadas
  const [edgeFunctionsDeployed, setEdgeFunctionsDeployed] = useState(false);
  
  useEffect(() => {
    const checkEdgeFunctions = async () => {
      try {
        // Tenta fazer uma chamada OPTIONS para verificar se a função existe
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://qewlxnjqojxprkodfdqf.supabase.co'}/functions/v1/check-subscription`,
          { method: 'OPTIONS' }
        );
        
        setEdgeFunctionsDeployed(response.status !== 404);
      } catch (error) {
        console.error('Erro ao verificar edge functions:', error);
        setEdgeFunctionsDeployed(false);
      }
    };
    
    checkEdgeFunctions();
  }, []);

  return (
    <div>
      <PageHeader
        title="Assinatura"
        description="Escolha o plano ideal para suas necessidades"
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCheckSubscription}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {showDebug && debugInfo && (
        <Alert className="mb-6 border-blue-400 bg-blue-50">
          <div className="flex flex-col">
            <h3 className="font-bold">Informações de Debug</h3>
            <div className="text-xs mt-1 overflow-auto max-h-32">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            <p className="text-xs mt-2">Última verificação: {lastChecked}</p>
          </div>
        </Alert>
      )}

      {!edgeFunctionsDeployed && (
        <Alert className="mb-6 border-amber-400 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Configuração necessária</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">Para habilitar pagamentos com Stripe, você precisa configurar as Edge Functions no Supabase:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Implante as três Edge Functions (check-subscription, create-checkout, customer-portal) no Supabase</li>
              <li>Configure o STRIPE_SECRET_KEY nas variáveis de ambiente do Supabase</li>
              <li>Habilite o CORS para permitir requisições do seu domínio</li>
            </ol>
            <p className="mt-2">Enquanto isso, o sistema funcionará em modo de simulação para desenvolvimento.</p>
          </AlertDescription>
        </Alert>
      )}

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
