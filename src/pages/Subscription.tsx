
import React, { useState, useEffect } from 'react';
import { Check, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const Subscription = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<null | {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>(null);
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
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
    checkSubscriptionStatus();
  }, [user]);
  
  // Format subscription end date
  const formatSubscriptionEnd = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const isSubscribed = subscription?.subscribed || user?.isSubscribed || false;
  const subscriptionTier = subscription?.subscription_tier || user?.subscriptionTier || null;
  const subscriptionEnd = subscription?.subscription_end || user?.subscriptionEnd || null;
  
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
        {/* Free Plan */}
        <Card className={`border-2 ${!isSubscribed ? 'border-blue-500' : 'border-gray-200'} relative`}>
          {!isSubscribed && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Plano Atual</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle>Gratuito</CardTitle>
            <CardDescription>
              Funcionalidades básicas para começar
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">R$ 0</span>
              <span className="text-gray-500 ml-1">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>1 empresa cadastrada</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>1 veículo cadastrado</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Acesso ao dashboard básico</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Registro de rendimentos e despesas</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Sem exportação para PDF</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Sem cálculo de custo por km</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={!isSubscribed}>
              {!isSubscribed ? 'Plano Atual' : 'Mudar para Este Plano'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`border-2 ${subscriptionTier === 'premium' ? 'border-blue-500' : 'border-gray-200'} relative md:scale-105 shadow-lg`}>
          {subscriptionTier === 'premium' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Plano Atual</Badge>
            </div>
          )}
          {!subscriptionTier && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Recomendado</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>
              O plano ideal para controle completo
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">R$ 15</span>
              <span className="text-gray-500 ml-1">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Empresas ilimitadas</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Veículos ilimitados</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Dashboard completo com análises</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Exportação para PDF</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Cálculo detalhado de custo por km</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isSubscribed ? (
              <Button className="w-full" variant="outline" onClick={openCustomerPortal} disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Gerenciar Assinatura'}
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('premium')}
                disabled={isLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isLoading ? 'Processando...' : 'Assinar Agora'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className={`border-2 ${subscriptionTier === 'enterprise' ? 'border-blue-500' : 'border-gray-200'} relative`}>
          {subscriptionTier === 'enterprise' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Plano Atual</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle>Empresarial</CardTitle>
            <CardDescription>
              Para frotas e equipes maiores
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">R$ 99</span>
              <span className="text-gray-500 ml-1">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Tudo do plano Premium</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Acesso para até 10 usuários</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Dashboard com KPIs avançados</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Relatórios personalizados</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>API para integração com outros sistemas</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Suporte 24/7 dedicado</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isSubscribed ? (
              <Button variant="outline" className="w-full" onClick={openCustomerPortal} disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Gerenciar Assinatura'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe('enterprise')}
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Assinar Plano Empresarial'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {isSubscribed && subscriptionTier && subscriptionEnd && (
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Informações da sua assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Plano atual:</span>
                <span>{subscriptionTier === 'premium' ? 'Premium' : 'Empresarial'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Próxima cobrança:</span>
                <span>{formatSubscriptionEnd(subscriptionEnd)}</span>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={openCustomerPortal} className="w-full">
                  Gerenciar assinatura
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Como funciona a cobrança?</h3>
              <p className="text-gray-600 mt-1">
                A cobrança é mensal e pode ser feita por cartão de crédito através do Stripe. Você pode cancelar sua assinatura a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-lg">Posso mudar de plano?</h3>
              <p className="text-gray-600 mt-1">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças serão aplicadas imediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-lg">E se eu cancelar minha assinatura?</h3>
              <p className="text-gray-600 mt-1">
                Se você cancelar sua assinatura, seu acesso continuará ativo até o final do período pago. Depois disso, sua conta será convertida para o plano gratuito.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
