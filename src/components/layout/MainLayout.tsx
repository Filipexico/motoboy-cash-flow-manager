
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  BanknoteIcon, 
  Receipt, 
  Fuel, 
  Car,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { toast } = useToast();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Empresas',
      path: '/empresas',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      name: 'Rendimentos',
      path: '/rendimentos',
      icon: <BanknoteIcon className="w-5 h-5" />
    },
    {
      name: 'Despesas',
      path: '/despesas',
      icon: <Receipt className="w-5 h-5" />
    },
    {
      name: 'Veículos',
      path: '/veiculos',
      icon: <Car className="w-5 h-5" />
    },
    {
      name: 'Abastecimentos',
      path: '/abastecimentos',
      icon: <Fuel className="w-5 h-5" />
    }
  ];
  
  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Você foi desconectado com sucesso.",
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 bg-white border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`dashboard-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="dashboard-link w-full justify-between text-gray-500 hover:text-red-500"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
