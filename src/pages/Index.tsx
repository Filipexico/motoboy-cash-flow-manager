
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Use setTimeout to ensure navigation happens after component is mounted
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 500);
    
    // Clean up timer
    return () => clearTimeout(timer);
  }, [navigate]);

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
