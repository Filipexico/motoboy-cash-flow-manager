
import React from 'react';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
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

interface SubscriptionPlanProps {
  title: string;
  description: string;
  price: number;
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  features: Array<{ name: string; included: boolean }>;
  onSubscribe: () => void;
  onManage: () => void;
  isSubscribed: boolean;
  isLoading: boolean;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  description,
  price,
  isCurrentPlan,
  isRecommended,
  features,
  onSubscribe,
  onManage,
  isSubscribed,
  isLoading,
}) => {
  return (
    <Card className={`border-2 ${isCurrentPlan ? 'border-blue-500' : 'border-gray-200'} relative ${isRecommended && !isCurrentPlan ? 'md:scale-105 shadow-lg' : ''}`}>
      {(isCurrentPlan || (isRecommended && !isSubscribed)) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {isCurrentPlan ? 'Plano Atual' : 'Recomendado'}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">R$ {price}</span>
          <span className="text-gray-500 ml-1">/mês</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? '' : 'text-gray-400'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isSubscribed ? (
          <Button 
            variant={isCurrentPlan ? "default" : "outline"} 
            className="w-full" 
            onClick={onManage} 
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Gerenciar Assinatura'}
          </Button>
        ) : (
          <Button
            variant={isRecommended ? "default" : "outline"}
            className="w-full"
            onClick={onSubscribe}
            disabled={isLoading || (price === 0 && !isCurrentPlan)}
          >
            {isLoading ? (
              'Processando...'
            ) : price === 0 ? (
              isCurrentPlan ? 'Plano Atual' : 'Mudar para Este Plano'
            ) : (
              <>
                {isRecommended && <CreditCard className="mr-2 h-4 w-4" />}
                {`Assinar ${price === 99 ? 'Plano Empresarial' : 'Agora'}`}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlan;
