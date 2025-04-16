import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, 
  Trash, 
  Check, 
  X,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  UserCog
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import UserManagementDialog from '@/components/admin/UserManagementDialog';
import UserRoleBadge from '@/components/admin/UserRoleBadge';
import { updateUserAdminStatus, deleteUser, getAllUsers } from '@/services/userManagementService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<any[]>([]);
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

  const handleRefreshUsers = () => {
    fetchUsers();
  };
  
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
      fetchUsers(); // Refresh users
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
      fetchUsers(); // Refresh users
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
      
      // Using the existing updateUserSubscription to keep compatibility
      const updatedUser = await updateUserSubscription(userId, !currentStatus, !currentStatus ? endDate : undefined);
      
      if (updatedUser) {
        toast({
          title: 'Assinatura alterada',
          description: `Assinatura ${!currentStatus ? 'ativada' : 'cancelada'}.`,
        });
        fetchUsers(); // Refresh users
      }
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
          <UserManagementDialog onUserCreated={handleRefreshUsers} />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshUsers}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="outline" className="text-sm px-2 py-1">
            {allUsers.length} Usuário(s)
          </Badge>
          <Badge variant="outline" className="text-sm px-2 py-1">
            {allUsers.filter(u => u.isSubscribed).length} Assinante(s)
          </Badge>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Assinante</TableHead>
                    <TableHead>Fim da Assinatura</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserRoleBadge isAdmin={u.isAdmin} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                            disabled={isUpdatingRole === u.id || u.id === user?.id} // Can't change your own role
                          >
                            {isUpdatingRole === u.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCog className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full ${u.isSubscribed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                          onClick={() => handleToggleSubscription(u.id, u.isSubscribed)}
                        >
                          {u.isSubscribed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {u.subscriptionEndDate 
                          ? format(new Date(u.subscriptionEndDate), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              disabled={isDeleting === u.id || u.id === user?.id} // Can't delete yourself
                            >
                              {isDeleting === u.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário <strong>{u.name}</strong>? 
                                Esta ação não pode ser desfeita e todos os dados associados serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade</CardTitle>
              <CardDescription>
                Monitore as ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mb-4 text-amber-500" />
                <h3 className="text-lg font-medium">Logs não disponíveis</h3>
                <p className="mt-2 max-w-md">
                  O sistema de logs de atividade será implementado em uma versão futura.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configurações gerais e opções avançadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mb-4 text-amber-500" />
                <h3 className="text-lg font-medium">Configurações não disponíveis</h3>
                <p className="mt-2 max-w-md">
                  As configurações avançadas do sistema serão implementadas em uma versão futura.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
