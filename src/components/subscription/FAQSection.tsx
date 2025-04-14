
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Usando as credenciais diretamente para evitar dependência de variáveis de ambiente
const SUPABASE_URL = 'https://qewlxnjqojxprkodfdqf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2x4bmpxb2p4cHJrb2RmZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjE0MTIsImV4cCI6MjA2MDE5NzQxMn0.lADhLBSYqfMPejc840DUUI-ylpihgiuHvHYYiHYnkKQ';
const isSupabaseConfigured = true; // Consideramos configurado pois as credenciais estão diretamente no código

const FAQSection: React.FC = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Perguntas Frequentes</CardTitle>
        {!isSupabaseConfigured && (
          <CardDescription className="text-red-500">
            Configuração incompleta - Verifique as variáveis de ambiente
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de configuração</AlertTitle>
            <AlertDescription>
              As variáveis de ambiente do Supabase não estão configuradas. Para usar o sistema de assinaturas, 
              você precisa definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env.
              <br/><br/>
              <strong>Importante:</strong> Após adicionar as variáveis, reinicie a aplicação.
            </AlertDescription>
          </Alert>
        )}
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
          <div>
            <h3 className="font-medium text-lg">Problemas técnicos?</h3>
            <p className="text-gray-600 mt-1">
              Em caso de problemas técnicos, entre em contato com nosso suporte técnico através do e-mail suporte@motocontrole.com.br.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQSection;
