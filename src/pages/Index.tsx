
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Use setTimeout para garantir que a navegação aconteça após o componente ser montado
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/landing');
      }
    }, 300); // Reduzido para melhor experiência do usuário
    
    // Limpar timer
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
        </div>
        <p className="text-gray-600">Carregando o aplicativo...</p>
      </div>
    </div>
  );
};

export default Index;
