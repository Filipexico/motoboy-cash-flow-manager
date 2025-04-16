
import React, { useEffect, useState } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import UserManagementDialog from '@/components/admin/UserManagementDialog';
import { updateUserAdminStatus, deleteUser, getAllUsers, updateUserSubscription } from '@/services/userManagementService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from '@/components/admin/UserTable';
import AdminStats from '@/components/admin/AdminStats';
import ComingSoonFeature from '@/components/admin/ComingSoonFeature';
import { User } from '@/types';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  
  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível obter a lista de usuários. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Redirect if not admin (this is a backup, we also check in App.tsx routes)
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setIsUpdatingRole(userId);
      await updateUserAdminStatus(userId, !currentStatus);
      toast({
        title: 'Status alterado',
        description: `Usuário ${!currentStatus ? 'promovido a administrador' : 'rebaixado de administrador'}.`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do usuário. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(userId);
      await deleteUser(userId);
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Não foi possível excluir o usuário. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleSubscription = async (userId: string, currentStatus: boolean) => {
    try {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
      
      await updateUserSubscription(userId, !currentStatus, !currentStatus ? endDate : undefined);
      
      toast({
        title: 'Assinatura alterada',
        description: `Assinatura ${!currentStatus ? 'ativada' : 'cancelada'}.`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Erro ao alterar assinatura',
        description: 'Não foi possível alterar a assinatura do usuário. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Administração"
        description="Gerencie usuários, assinaturas e configurações do sistema"
      >
        <div className="flex gap-2 items-center">
          <UserManagementDialog onUserCreated={fetchUsers} />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchUsers}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <AdminStats users={allUsers} />
        </div>
      </PageHeader>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie todos os usuários do sistema, controle permissões e assinaturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={allUsers}
                currentUserId={user?.id || ''}
                isUpdatingRole={isUpdatingRole}
                isDeleting={isDeleting}
                onToggleAdmin={handleToggleAdmin}
                onDeleteUser={handleDeleteUser}
                onToggleSubscription={handleToggleSubscription}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <ComingSoonFeature
            title="Logs de Atividade"
            description="Monitore as ações realizadas no sistema"
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <ComingSoonFeature
            title="Configurações do Sistema"
            description="Configurações gerais e opções avançadas"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
