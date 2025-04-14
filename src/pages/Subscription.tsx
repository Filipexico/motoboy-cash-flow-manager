
import React, { useState } from 'react';
import { Check, CreditCard, AlertCircle } from 'lucide-react';
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
import { updateUserSubscription } from '@/lib/data/users';

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock function to simulate Stripe payment processing
  const handleSubscribe = async (plan: 'premium' | 'enterprise') => {
    setIsLoading(true);
    
    try {
      // Determine which product to use
      const productId = plan === 'premium' 
        ? 'prod_S81I7orN9sLjzm'  // Premium plan
        : 'prod_S81KuZeZpl9bPM'; // Enterprise plan
      
      // In a real implementation, this would call a Stripe checkout session
      // Mock the behavior for now
      setTimeout(() => {
        if (user) {
          // In a real app, this would redirect to a payment gateway
          const oneYearLater = new Date();
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          
          const result = updateUserSubscription(user.id, true, oneYearLater);
          
          if (result) {
            toast({
              title: 'Assinatura ativada',
              description: 'Sua assinatura foi ativada com sucesso!',
            });
            
            // Force page reload to update user context
            window.location.href = '/';
          }
        }
        setIsLoading(false);
      }, 2000);
      
      toast({
        title: 'Processando pagamento',
        description: 'Você será redirecionado para o Stripe em instantes...',
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Erro na assinatura',
        description: 'Ocorreu um erro ao processar sua assinatura.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Assinatura"
        description="Escolha o plano ideal para suas necessidades"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="border-2 border-gray-200">
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
            <Button variant="outline" className="w-full" disabled={!user?.isSubscribed}>
              {!user?.isSubscribed ? 'Plano Atual' : 'Mudar para Este Plano'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-blue-500 relative md:scale-105 shadow-lg">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 hover:bg-blue-600">Recomendado</Badge>
          </div>
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
            {user?.isSubscribed ? (
              <Button className="w-full" variant="outline" disabled>
                Plano Atual
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
        <Card className="border-2 border-gray-200">
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
            {user?.isSubscribed ? (
              <Button variant="outline" className="w-full" disabled>
                Contate Vendas
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Como funciona a cobrança?</h3>
              <p className="text-gray-600 mt-1">
                A cobrança é mensal e pode ser feita por cartão de crédito. Você pode cancelar sua assinatura a qualquer momento.
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
