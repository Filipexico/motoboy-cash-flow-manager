
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RegisterLayoutProps {
  children: React.ReactNode;
  step: 1 | 2;
  error: string | null;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children, step, error }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          <p className="mt-2 text-gray-600">Crie sua conta</p>
          
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className="h-1 w-16 bg-gray-200">
              <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'Informações de Acesso' : 'Dados Pessoais'}
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no cadastro</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {children}
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 max-w-xl">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start mb-4">
          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-left">
            <p className="text-blue-800 font-medium">Sobre o MotoControle</p>
            <p className="text-blue-700 text-xs mt-1">O MotoControle é uma plataforma completa para controle financeiro e gerenciamento dos seus veículos. Após o cadastro, você terá acesso a todas as funcionalidades e poderá começar a usar o sistema imediatamente.</p>
          </div>
        </div>
        
        <p>• Todos os dados são armazenados com segurança</p>
        <p>• Seu endereço e telefone são usados apenas para contato</p>
        <p>• Não compartilhamos suas informações com terceiros</p>
      </div>
    </div>
  );
};

export default RegisterLayout;
