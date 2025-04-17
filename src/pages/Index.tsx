
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initialCheckDone } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [manualCheckPerformed, setManualCheckPerformed] = useState(false);

  // Verificação manual do estado de autenticação como fallback
  useEffect(() => {
    const manualCheckAuth = async () => {
      if (!manualCheckPerformed && isLoading && !initialCheckDone) {
        try {
          console.log("Index: Realizando verificação manual de autenticação...");
          const { data } = await supabase.auth.getSession();
          const hasSession = !!data.session;
          
          console.log("Index: Verificação manual completada, sessão encontrada:", hasSession);
          
          // Se o timeout ocorrer e tivermos informações de sessão, navegar adequadamente
          if (hasSession) {
            console.log("Index: Navegando para dashboard com base na verificação manual");
            navigate('/dashboard');
          } else {
            console.log("Index: Navegando para landing com base na verificação manual");
            navigate('/landing');
          }
          
          setCheckingAuth(false);
          setManualCheckPerformed(true);
        } catch (error) {
          console.error("Index: Erro na verificação manual:", error);
        }
      }
    };
    
    // Definir um timeout maior para o caso do AuthContext demorar
    const timeoutId = setTimeout(() => {
      if (checkingAuth && !initialCheckDone) {
        console.log("Index: Timeout da verificação normal, iniciando verificação manual");
        manualCheckAuth();
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, initialCheckDone, navigate, checkingAuth, manualCheckPerformed]);

  // Verificação normal pelo AuthContext
  useEffect(() => {
    console.log("Index: Estado de autenticação -", 
      isAuthenticated ? "Autenticado" : "Não autenticado", 
      isLoading ? "Carregando" : "Não carregando",
      initialCheckDone ? "Verificação inicial concluída" : "Verificação inicial pendente"
    );
    
    // Adicionar mais logs informativos para depuração
    if (isAuthenticated && initialCheckDone) {
      console.log("Index: Verificação de autenticação concluída - Usuário autenticado, redirecionando para dashboard");
    } else if (!isAuthenticated && initialCheckDone) {
      console.log("Index: Verificação de autenticação concluída - Usuário NÃO autenticado, redirecionando para landing");
    }
    
    // Navegar apenas após verificar o status de autenticação
    if (!isLoading && initialCheckDone) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log("Index: Navegando para dashboard");
          navigate('/dashboard');
        } else {
          console.log("Index: Navegando para landing");
          navigate('/landing');
        }
        setCheckingAuth(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated, isLoading, initialCheckDone]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
        </div>
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 mb-2">Carregando o aplicativo...</p>
          <p className="text-gray-400 text-sm">Verificando suas credenciais</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
