
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the landing page instead of protected dashboard
    navigate('/landing');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      Redirecionando...
    </div>
  );
};

export default Index;
