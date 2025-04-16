import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, CreditCard, DollarSign, Lock, Shield, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

const Subscription = () => {
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    tier: null as string | null,
    endDate: null as string | null,
  });

  useEffect(() => {
    if (user) {
      setSubscriptionStatus({
        isSubscribed: user.isSubscribed || false,
        tier: user.subscriptionTier,
        endDate: user.subscriptionEndDate ? formatDate(new Date(user.subscriptionEndDate)) : null,
      });
    }
  }, [user]);

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para assinar um plano",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would redirect to a payment processor
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para a página de pagamento",
      });

      // Simulate a successful subscription for demo purposes
      const { error } = await supabase.rpc('update_user_subscription', {
        user_id_param: user.id,
        is_subscribed_param: true,
        subscription_end_param: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });

      if (error) throw error;

      // Update local state
      await checkSubscription();
      
      toast({
        title: "Assinatura realizada com sucesso!",
        description: `Você agora é um assinante do plano ${tier}`,
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Erro na assinatura",
        description: "Não foi possível processar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Planos de Assinatura</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano que melhor atende às suas necessidades e tenha acesso a recursos exclusivos para gerenciar seus veículos e finanças.
          </p>
        </div>

        {subscriptionStatus.isSubscribed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="text-blue-500 mr-4 mt-1" />
              <div>
                <h3 className="font-bold text-blue-800 text-lg">Você já é um assinante!</h3>
                <p className="text-blue-700 mt-1">
                  Você está atualmente no plano <strong>{subscriptionStatus.tier || 'Premium'}</strong>.
                  {subscriptionStatus.endDate && (
                    <span> Sua assinatura é válida até <strong>{subscriptionStatus.endDate}</strong>.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plano Básico */}
          <Card className="border-2 hover:border-blue-300 transition-all">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Plano Básico</span>
                <Badge variant="outline" className="bg-blue-50">Grátis</Badge>
              </CardTitle>
              <CardDescription>Para usuários iniciantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">R$ 0</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Registro de até 2 veículos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Controle básico de despesas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Relatórios mensais simples</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={true}
              >
                Plano Atual
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Premium */}
          <Card className="border-2 border-blue-300 shadow-lg relative">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <Badge className="bg-blue-500">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Plano Premium</span>
                <Star className="h-5 w-5 text-yellow-400" />
              </CardTitle>
              <CardDescription>Para motoristas profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">R$ 19,90</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Registro de até 5 veículos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Controle avançado de despesas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Relatórios detalhados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Alertas de manutenção</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Exportação de dados</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSubscribe('Premium')}
                disabled={isLoading || subscriptionStatus.isSubscribed}
              >
                {isLoading ? 'Processando...' : subscriptionStatus.isSubscribed ? 'Assinado' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Empresarial */}
          <Card className="border-2 hover:border-blue-300 transition-all">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Plano Empresarial</span>
                <Shield className="h-5 w-5 text-purple-500" />
              </CardTitle>
              <CardDescription>Para frotas e empresas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">R$ 49,90</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Veículos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Controle completo de frotas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Relatórios personalizados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Gestão de motoristas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>API para integração</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe('Enterprise')}
                disabled={isLoading || subscriptionStatus.isSubscribed}
              >
                {isLoading ? 'Processando...' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                Como funciona o pagamento?
              </h3>
              <p className="text-gray-600 mt-1 ml-6">
                Aceitamos cartões de crédito e débito. O pagamento é processado de forma segura e você pode cancelar a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600 mt-1 ml-6">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor no próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h3 className="font-medium flex items-center">
                <Lock className="h-4 w-4 mr-2 text-blue-500" />
                Meus dados estão seguros?
              </h3>
              <p className="text-gray-600 mt-1 ml-6">
                Sim, utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger seus dados.
              </p>
            </div>
            <div>
              <h3 className="font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                Existe política de reembolso?
              </h3>
              <p className="text-gray-600 mt-1 ml-6">
                Oferecemos garantia de satisfação de 14 dias. Se você não estiver satisfeito, reembolsamos 100% do valor pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
