
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Lock, RefreshCw, Shield, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import SubscriptionPlan from '@/components/subscription/SubscriptionPlan';
import SubscriptionDetails from '@/components/subscription/SubscriptionDetails';
import FAQSection from '@/components/subscription/FAQSection';
import { useSubscription } from '@/hooks/use-subscription';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isLoading, 
    isSubscribed, 
    subscriptionTier, 
    subscriptionEnd,
    checkSubscriptionStatus,
    handleSubscribe, 
    openCustomerPortal 
  } = useSubscription();

  // Verificar status da assinatura ao carregar a página
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Features de cada plano
  const basicFeatures = [
    { name: 'Registro de até 2 veículos', included: true },
    { name: 'Controle básico de despesas', included: true },
    { name: 'Relatórios mensais simples', included: true },
    { name: 'Visualizações limitadas', included: true },
    { name: 'Backup de dados', included: false },
    { name: 'Suporte prioritário', included: false },
  ];
  
  const premiumFeatures = [
    { name: 'Registro de até 5 veículos', included: true },
    { name: 'Controle avançado de despesas', included: true },
    { name: 'Relatórios detalhados', included: true },
    { name: 'Alertas de manutenção', included: true },
    { name: 'Exportação de dados', included: true },
    { name: 'Suporte por email', included: true },
  ];
  
  const enterpriseFeatures = [
    { name: 'Veículos ilimitados', included: true },
    { name: 'Controle completo de frotas', included: true },
    { name: 'Relatórios personalizados', included: true },
    { name: 'Gestão de motoristas', included: true },
    { name: 'API para integração', included: true },
    { name: 'Suporte prioritário 24/7', included: true },
  ];

  const handleManualCheck = () => {
    checkSubscriptionStatus();
    toast({
      title: 'Verificando assinatura',
      description: 'Atualizando informações da sua assinatura...',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Planos de Assinatura</h1>
            <p className="text-gray-600">
              Escolha o plano que melhor atende às suas necessidades.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualCheck} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar status
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-500">Verificando informações da assinatura...</p>
            </div>
          </div>
        ) : (
          <>
            {isSubscribed && subscriptionEnd && (
              <SubscriptionDetails
                subscriptionTier={subscriptionTier || 'premium'}
                subscriptionEnd={subscriptionEnd}
                onManage={openCustomerPortal}
              />
            )}

            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <SubscriptionPlan
                title="Plano Básico"
                description="Para usuários iniciantes"
                price={0}
                features={basicFeatures}
                isCurrentPlan={!isSubscribed}
                isRecommended={false}
                onSubscribe={() => {}}
                onManage={openCustomerPortal}
                isSubscribed={isSubscribed}
                isLoading={isLoading}
              />
              
              <SubscriptionPlan
                title="Plano Premium"
                description="Para motoristas profissionais"
                price={19.90}
                features={premiumFeatures}
                isCurrentPlan={isSubscribed && subscriptionTier === 'premium'}
                isRecommended={true}
                onSubscribe={() => handleSubscribe('premium')}
                onManage={openCustomerPortal}
                isSubscribed={isSubscribed}
                isLoading={isLoading}
              />
              
              <SubscriptionPlan
                title="Plano Empresarial"
                description="Para frotas e empresas"
                price={49.90}
                features={enterpriseFeatures}
                isCurrentPlan={isSubscribed && subscriptionTier === 'enterprise'}
                isRecommended={false}
                onSubscribe={() => handleSubscribe('enterprise')}
                onManage={openCustomerPortal}
                isSubscribed={isSubscribed}
                isLoading={isLoading}
              />
            </div>

            <FAQSection />
          </>
        )}
      </div>
    </div>
  );
};

export default Subscription;
