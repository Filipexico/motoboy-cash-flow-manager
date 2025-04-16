
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, User, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminDebug = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      
      // Buscar usuários dos subscribers
      const { data, error } = await supabase
        .from('subscribers')
        .select('*, user_profiles:user_profiles(*)');
        
      if (error) throw error;
      
      setUsers(data || []);
      
      toast({
        title: "Usuários carregados",
        description: `${data?.length || 0} usuários encontrados.`
      });
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  const createAdminUser = async () => {
    try {
      setIsCreatingAdmin(true);
      
      // Criar usuário administrador diretamente via RPC
      const { data, error } = await supabase
        .rpc('create_admin_user', {
          email: 'admin@motocontrole.com',
          password: 'Admin@123',
          full_name: 'Administrador do Sistema'
        });
        
      if (error) throw error;
      
      toast({
        title: "Administrador criado",
        description: "Usuário admin@motocontrole.com criado com sucesso. Senha: Admin@123",
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao criar administrador:', error);
      toast({
        title: "Erro ao criar administrador",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso negado</AlertTitle>
          <AlertDescription>
            Esta página é restrita a administradores do sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Debug Administrativo
          </CardTitle>
          <CardDescription>
            Ferramenta de diagnóstico e gerenciamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Ambiente de debug</AlertTitle>
              <AlertDescription className="text-amber-700">
                Esta página mostra informações sensíveis. Use apenas para fins de diagnóstico.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-800">Usuário atual</h3>
                <p className="text-blue-600">{user?.email}</p>
                <p className="text-sm text-blue-500">
                  Função: {user?.isAdmin ? 'Administrador' : 'Usuário comum'}
                </p>
              </div>
              <Shield className={`h-8 w-8 ${user?.isAdmin ? 'text-green-500' : 'text-gray-400'}`} />
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Administração de Usuários</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoadingUsers}>
                    {isLoadingUsers ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Atualizar
                  </Button>
                  <Button size="sm" onClick={createAdminUser} disabled={isCreatingAdmin}>
                    {isCreatingAdmin ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    Criar Admin
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum usuário encontrado.</p>
                ) : (
                  users.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardHeader className={`py-3 ${user.role === 'admin' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {user.email}
                          </CardTitle>
                          {user.role === 'admin' && (
                            <Shield className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          ID: {user.user_id}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium">Papel</p>
                            <p>{user.role || 'user'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Assinatura</p>
                            <p>{user.subscribed ? 'Ativa' : 'Inativa'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Nome</p>
                            <p>{user.user_profiles?.full_name || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Criado em</p>
                            <p>{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Última atualização: {new Date().toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDebug;
