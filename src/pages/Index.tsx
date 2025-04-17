
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initialCheckDone } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    console.log("Index: Auth state -", 
      isAuthenticated ? "Authenticated" : "Not authenticated", 
      isLoading ? "Loading" : "Not loading",
      initialCheckDone ? "Initial check done" : "Initial check pending"
    );
    
    // Add more informative logging for debugging
    if (isAuthenticated && initialCheckDone) {
      console.log("Index: Auth check complete - User is authenticated, will redirect to dashboard");
    } else if (!isAuthenticated && initialCheckDone) {
      console.log("Index: Auth check complete - User is NOT authenticated, will redirect to landing");
    }
    
    // Only navigate after we've checked auth status
    if (!isLoading && initialCheckDone) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log("Index: Navigating to dashboard");
          navigate('/dashboard');
        } else {
          console.log("Index: Navigating to landing");
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
