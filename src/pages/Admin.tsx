
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from '@/components/common/PageHeader';
import UserTable from '@/components/admin/UserTable';
import { Shield } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      const enhancedUsers = await Promise.all(users.map(async (user) => {
        const { data: subscriberData } = await supabase
          .from('subscribers')
          .select('role, subscribed')
          .eq('user_id', user.id)
          .single();
        
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          createdAt: user.created_at,
          isAdmin: user.app_metadata?.role === 'admin',
          isSubscribed: subscriberData?.subscribed || false,
        };
      }));

      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível obter a lista de usuários.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      const { error } = await supabase.rpc('set_user_admin_status', {
        user_id_param: userId,
        is_admin_param: makeAdmin
      });
      
      if (error) throw error;

      toast({
        title: "Permissões atualizadas",
        description: `Usuário ${makeAdmin ? 'promovido a administrador' : 'rebaixado para usuário comum'}.`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro ao atualizar permissões",
        description: "Não foi possível atualizar as permissões do usuário.",
        variant: "destructive",
      });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Administração"
        description="Gerencie usuários e configurações do sistema"
      />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            currentUserId={user.id}
            onDeleteUser={handleDeleteUser}
            onToggleAdmin={handleToggleAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
