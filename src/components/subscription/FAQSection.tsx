
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

const FAQSection: React.FC = () => {
  return (
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
  );
};

export default FAQSection;
