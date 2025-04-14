
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SubscriptionDetailsProps {
  subscriptionTier: string;
  subscriptionEnd: string;
  onManage: () => void;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscriptionTier,
  subscriptionEnd,
  onManage,
}) => {
  const formatSubscriptionEnd = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
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
            <Button variant="outline" onClick={onManage} className="w-full">
              Gerenciar assinatura
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetails;
